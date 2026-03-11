// config.js
const SUPABASE_URL = "https://zymeymkjuxcvounrqlfe.supabase.co";
const SUPABASE_KEY = "sb_publishable_2wFMgNsPUHMqGjCK9HqNpg_eagKtJM2";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * SECURITY NOTE:
 * This key is a publishable/anon key and is safe to expose on the client.
 * Your REAL security layer is Supabase Row Level Security (RLS).
 * Make sure RLS policies are enabled on all tables (profiles, articles, system_status).
 */

/**
 * Central auth helper — fetches the current user + their profile in one call.
 * Returns { user, profile } or redirects to index.html if not authenticated.
 * Optionally checks for admin privileges.
 *
 * @param {boolean} requireAdmin - If true, redirects non-admins to dashboard
 * @returns {{ user: object, profile: object }}
 */
async function requireAuth(requireAdmin = false) {
    const { data: { user }, error: authError } = await _supabase.auth.getUser();

    if (authError || !user) {
        window.location.href = "index.html";
        return null;
    }

    const { data: profile, error: profileError } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        window.location.href = "index.html";
        return null;
    }

    // Banned users get immediately signed out
    if (profile.is_banned) {
        await _supabase.auth.signOut();
        window.location.href = "index.html?error=session_terminated";
        return null;
    }

    // Admin gate
    if (requireAdmin && !profile.is_admin && !profile.is_overseer && !profile.is_terminal_admin) {
        alert("ACCESS_DENIED: ADMINISTRATIVE_PRIVILEGES_REQUIRED");
        window.location.href = "dashboard.html";
        return null;
    }

    return { user, profile };
}
