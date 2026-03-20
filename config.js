// config.js
const SUPABASE_URL = "https://zymeymkjuxcvounrqlfe.supabase.co";
const SUPABASE_KEY = "sb_publishable_2wFMgNsPUHMqGjCK9HqNpg_eagKtJM2";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Central auth helper.
 */
async function requireAuth(requireAdmin = false) {
    const { data: { user }, error: authError } = await _supabase.auth.getUser();
    if (authError || !user) { window.location.href = 'index.html'; return null; }

    const { data: profile, error: profileError } = await _supabase
        .from('profiles').select('*').eq('id', user.id).single();

    if (profileError || !profile) { window.location.href = 'index.html'; return null; }

    if (profile.is_banned) {
        await _supabase.auth.signOut();
        window.location.href = 'index.html?error=session_terminated';
        return null;
    }

    if (requireAdmin && !profile.is_admin && !profile.is_overseer && !profile.is_terminal_admin) {
        alert('ACCESS_DENIED: ADMINISTRATIVE_PRIVILEGES_REQUIRED');
        window.location.href = 'dashboard.html';
        return null;
    }

    return { user, profile };
}

/**
 * Full clearance level registry (0-8).
 */
const CLEARANCE_LEVELS = [
    { value: 0, label: 'LEVEL 0 — PUBLIC',       short: 'L0',       color: 'var(--text-dim)' },
    { value: 1, label: 'LEVEL 1 — RESTRICTED',   short: 'L1',       color: '#4ade80' },
    { value: 2, label: 'LEVEL 2 — CONFIDENTIAL', short: 'L2',       color: '#facc15' },
    { value: 3, label: 'LEVEL 3 — SECRET',       short: 'L3',       color: '#fb923c' },
    { value: 4, label: 'LEVEL 4 — TOP SECRET',   short: 'L4',       color: 'var(--red)' },
    { value: 5, label: 'LEVEL 5 — CLASSIFIED',   short: 'L5',       color: '#a78bfa' },
    { value: 6, label: 'LEVEL 6 — OMNI',         short: 'OMNI',     color: 'var(--gold)' },
    { value: 7, label: 'LEVEL 7 — APOLLYON',     short: 'APOLLYON', color: 'var(--red)' },
    { value: 8, label: 'LEVEL 8 — MASKUR',       short: 'MASKUR',   color: 'var(--gold)' },
];

/**
 * Returns clearance info for a given numeric level.
 */
function getClearanceByLevel(level) {
    return CLEARANCE_LEVELS.find(c => c.value === level) ||
           { value: level, label: `LEVEL ${level}`, short: `L${level}`, color: 'var(--text-dim)' };
}

/**
 * Returns clearance info for a profile.
 * Elevated roles automatically map to their designated level.
 */
function getClearanceInfo(profile) {
    return getClearanceByLevel(profile.clearance_level);
}

/**
 * Populates a clearance <select> element with all levels.
 * @param {string} selectId
 * @param {number|null} selectedValue
 * @param {number} maxLevel - Maximum level to show (default 8, use profile.clearance_level to cap)
 */
function populateClearanceSelect(selectId, selectedValue = null, maxLevel = 8) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = CLEARANCE_LEVELS
        .filter(c => c.value <= maxLevel)
        .map(c => `<option value="${c.value}" ${c.value === selectedValue ? 'selected' : ''}>${c.label}</option>`)
        .join('');
}

/**
 * Write an entry to the audit log.
 */
async function logAction(actor, action, target, details = null) {
    try {
        await _supabase.from('audit_log').insert([{
            actor_id:    actor.id,
            actor_name:  actor.full_name || 'UNKNOWN',
            action,
            target_name: target || null,
            details:     details || null,
        }]);
    } catch (e) {
        console.warn('Audit log write failed:', e);
    }
}
