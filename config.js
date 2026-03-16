// config.js
const SUPABASE_URL = "https://zymeymkjuxcvounrqlfe.supabase.co";
const SUPABASE_KEY = "sb_publishable_2wFMgNsPUHMqGjCK9HqNpg_eagKtJM2";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Central auth helper.
 * Fetches the current user + their profile in one call.
 * Redirects to index.html if unauthenticated or banned.
 * @param {boolean} requireAdmin - If true, redirects non-admins to dashboard
 * @returns {{ user, profile } | null}
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
 * Write an entry to the audit log.
 * Silently fails so it never breaks the main action.
 *
 * @param {object} actor  - The profile of the user performing the action
 * @param {string} action - Action type e.g. 'APPROVED', 'BANNED', 'DELETED', 'CREATED', 'FLAGGED', 'UNFLAGGED', 'REVOKED'
 * @param {string} target - Name of the affected user or document
 * @param {string} details - Optional extra context
 */
async function logAction(actor, action, target, details = null) {
    try {
        await _supabase.from('audit_log').insert([{
            actor_id:   actor.id,
            actor_name: actor.full_name || 'UNKNOWN',
            action,
            target_name: target || null,
            details:     details || null,
        }]);
    } catch (e) {
        // Silently ignore — audit log failure should never block main actions
        console.warn('Audit log write failed:', e);
    }
}
