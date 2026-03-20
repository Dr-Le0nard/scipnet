// notifications.js — SCiPNET Notification System
// Handles: tab title flashing, alarm sound, online presence tracking

// ============================================================
// TAB FLASH
// ============================================================
let _flashInterval = null;
let _originalTitle = document.title;

function flashTab(message, color = '🔴') {
    if (_flashInterval) return; // already flashing
    let toggle = false;
    _originalTitle = document.title;
    _flashInterval = setInterval(() => {
        document.title = toggle ? _originalTitle : `${color} ${message}`;
        toggle = !toggle;
    }, 800);
}

function stopFlash() {
    if (_flashInterval) {
        clearInterval(_flashInterval);
        _flashInterval = null;
        document.title = _originalTitle;
    }
}

// Stop flashing when user focuses the tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) stopFlash();
});
window.addEventListener('focus', stopFlash);

// ============================================================
// ALARM SOUND (Web Audio API — no files needed)
// ============================================================
let _audioCtx = null;

function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
}

/**
 * Play a classic SCP-style klaxon alarm.
 * Two-tone repeating pattern, 3 cycles.
 */
function playAlarm() {
    try {
        const ctx = getAudioCtx();
        const cycles = 3;
        const toneDuration = 0.4;
        const gapDuration  = 0.1;

        for (let i = 0; i < cycles; i++) {
            const startTime = ctx.currentTime + i * (toneDuration * 2 + gapDuration * 2);

            // Tone 1 — high
            playTone(ctx, 880, startTime, toneDuration, 0.3);
            // Tone 2 — low
            playTone(ctx, 660, startTime + toneDuration + gapDuration, toneDuration, 0.3);
        }
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
}

function playTone(ctx, frequency, startTime, duration, gain) {
    const oscillator = ctx.createOscillator();
    const gainNode   = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type      = 'sawtooth'; // harsh, industrial sound
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    gainNode.gain.setValueAtTime(gain, startTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

// ============================================================
// ONLINE PRESENCE
// ============================================================
let _presenceInterval = null;
let _presenceProfile  = null;

/**
 * Start tracking this user as online.
 * Call once after auth resolves.
 */
async function startPresence(profile) {
    _presenceProfile = profile;
    await _upsertPresence();
    // Heartbeat every 30 seconds
    _presenceInterval = setInterval(_upsertPresence, 30000);
    // Clean up on page unload
    window.addEventListener('beforeunload', stopPresence);
}

async function _upsertPresence() {
    if (!_presenceProfile) return;
    try {
        await _supabase.from('presence').upsert({
            user_id:    _presenceProfile.id,
            full_name:  _presenceProfile.full_name,
            department: _presenceProfile.department,
            last_seen:  new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (e) {}
}

async function stopPresence() {
    if (_presenceInterval) { clearInterval(_presenceInterval); _presenceInterval = null; }
    if (_presenceProfile) {
        try { await _supabase.from('presence').delete().eq('user_id', _presenceProfile.id); } catch (e) {}
    }
}

/**
 * Fetch currently online users (seen in last 60 seconds).
 */
async function getOnlineUsers() {
    const since = new Date(Date.now() - 60000).toISOString();
    const { data, error } = await _supabase
        .from('presence')
        .select('full_name, department, last_seen')
        .gte('last_seen', since)
        .order('full_name', { ascending: true });
    return error ? [] : data;
}

// ============================================================
// GLOBAL ALERT LISTENER
// Watches system_status and incident_reports for changes
// and triggers tab flash + alarm accordingly
// ============================================================
function initNotificationListeners(currentProfile) {
    // Watch for site-wide alert broadcasts
    _supabase.channel('notify_system_status')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_status' }, payload => {
            if (payload.new.is_active && payload.new.alert_message) {
                flashTab('SITE ALERT', '🚨');
                playAlarm();
                if (typeof toast === 'function') {
                    toast(`ALERT: ${payload.new.alert_message}`, 'warning', 8000);
                }
            }
        })
        .subscribe();

    // Watch for new Critical or Urgent incident reports
    _supabase.channel('notify_incidents')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incident_reports' }, payload => {
            const inc = payload.new;
            // Only flash for Critical/Urgent, or if assigned to current user's dept
            const isRelevant = inc.priority === 'Critical' || inc.priority === 'Urgent' ||
                               inc.assigned_department === currentProfile?.department;
            if (isRelevant) {
                flashTab('INCIDENT FILED', '🔴');
                if (inc.priority === 'Critical') playAlarm();
                if (typeof toast === 'function') {
                    toast(`NEW INCIDENT: ${inc.title} [${inc.priority.toUpperCase()}]`,
                          inc.priority === 'Critical' ? 'error' : 'warning', 8000);
                }
            }
        })
        .subscribe();
}
