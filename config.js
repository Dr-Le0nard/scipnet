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
 * Returns the clearance designation for a profile.
 * Elevated roles get special labels; standard personnel get numeric levels.
 *
 * @param {object} profile
 * @returns {{ label: string, short: string, color: string }}
 */
function getClearanceInfo(profile) {
    if (profile.is_terminal_admin) {
        return { label: 'MASKUR', short: 'MASKUR', color: 'var(--gold)' };
    }
    if (profile.is_overseer) {
        return { label: 'APOLLYON', short: 'APOLLYON', color: 'var(--red)' };
    }
    if (profile.is_admin) {
        return { label: 'OMNI', short: 'OMNI', color: 'var(--gold)' };
    }
    // Standard numeric clearance
    const LEVEL_LABELS = {
        0: { label: 'LEVEL 0 — PUBLIC',       short: 'L0', color: 'var(--text-dim)' },
        1: { label: 'LEVEL 1 — RESTRICTED',   short: 'L1', color: '#4ade80' },
        2: { label: 'LEVEL 2 — CONFIDENTIAL', short: 'L2', color: '#facc15' },
        3: { label: 'LEVEL 3 — SECRET',       short: 'L3', color: '#fb923c' },
        4: { label: 'LEVEL 4 — TOP SECRET',   short: 'L4', color: 'var(--red)' },
        5: { label: 'LEVEL 5 — CLASSIFIED',   short: 'L5', color: '#a78bfa' },
    };
    return LEVEL_LABELS[profile.clearance_level] || { label: `LEVEL ${profile.clearance_level}`, short: `L${profile.clearance_level}`, color: 'var(--text-dim)' };
}
 
/**
 * Returns just the short clearance label for a profile.
 * Useful for tables and compact displays.
 */
function getClearanceShort(profile) {
    return getClearanceInfo(profile).short;
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
