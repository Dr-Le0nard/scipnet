// config.js
const SUPABASE_URL = "https://zymeymkjuxcvounrqlfe.supabase.co";
const SUPABASE_KEY = "sb_publishable_2wFMgNsPUHMqGjCK9HqNpg_eagKtJM2";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// AUTH
// ============================================================

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

// ============================================================
// CLEARANCE LEVELS (0-8)
// ============================================================

const CLEARANCE_LEVELS = [
    { value: 0, label: 'LEVEL 0 - PUBLIC',       short: 'L0',       color: 'var(--text-dim)' },
    { value: 1, label: 'LEVEL 1 - RESTRICTED',   short: 'L1',       color: '#4ade80' },
    { value: 2, label: 'LEVEL 2 - CONFIDENTIAL', short: 'L2',       color: '#facc15' },
    { value: 3, label: 'LEVEL 3 - SECRET',       short: 'L3',       color: '#fb923c' },
    { value: 4, label: 'LEVEL 4 - TOP SECRET',   short: 'L4',       color: 'var(--red)' },
    { value: 5, label: 'LEVEL 5 - CLASSIFIED',   short: 'L5',       color: '#a78bfa' },
    { value: 6, label: 'LEVEL 6 - OMNI',         short: 'OMNI',     color: 'var(--gold)' },
    { value: 7, label: 'LEVEL 7 - APOLLYON',     short: 'APOLLYON', color: 'var(--red)' },
    { value: 8, label: 'LEVEL 8 - MASKUR',       short: 'MASKUR',   color: 'var(--gold)' },
];

function getClearanceByLevel(level) {
    return CLEARANCE_LEVELS.find(function(c) { return c.value === level; }) ||
        { value: level, label: 'LEVEL ' + level, short: 'L' + level, color: 'var(--text-dim)' };
}

function getClearanceInfo(profile) {
    return getClearanceByLevel(profile.clearance_level);
}

function populateClearanceSelect(selectId, selectedValue, maxLevel) {
    if (selectedValue === undefined) selectedValue = null;
    if (maxLevel === undefined) maxLevel = 8;
    var sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = CLEARANCE_LEVELS
        .filter(function(c) { return c.value <= maxLevel; })
        .map(function(c) {
            return '<option value="' + c.value + '"' + (c.value === selectedValue ? ' selected' : '') + '>' + c.label + '</option>';
        })
        .join('');
}

// ============================================================
// MULTI-ROLE SYSTEM
// ============================================================

/**
 * Returns the currently active role for a profile.
 * Only considers approved roles. Falls back to primary if none active.
 */
function getActiveRole(profile, roles) {
    if (!roles) roles = [];
    var approvedRoles = roles.filter(function(r) { return r.status === 'Approved'; });
    if (profile.active_role_id && approvedRoles.length > 0) {
        var active = approvedRoles.find(function(r) { return r.id === profile.active_role_id; });
        if (active) {
            var activeRoleDef = typeof getRoleByKey === 'function' ? getRoleByKey(active.role_key) : null;
            return {
                name:        active.role_name,
                baseName:    typeof getRoleBaseName === 'function' ? getRoleBaseName(active) : active.role_name,
                department:  active.department,
                clearance:   active.clearance_level || 0,
                roleKey:     active.role_key || null,
                roleTitle:   activeRoleDef ? activeRoleDef.title : null,
                isSecondary: true,
                roleId:      active.id
            };
        }
    }
    var primaryRoleDef = typeof getRoleByKey === 'function' ? getRoleByKey(profile.role_key) : null;
    return {
        name:        profile.full_name,
        baseName:    typeof getProfileBaseName === 'function' ? getProfileBaseName(profile) : profile.full_name,
        department:  profile.department,
        clearance:   profile.clearance_level,
        roleKey:     profile.role_key || null,
        roleTitle:   primaryRoleDef ? primaryRoleDef.title : null,
        isSecondary: false,
        roleId:      null
    };
}

/**
 * Fetch all role entries for the current user (all statuses).
 */
async function fetchMyRoles() {
    var result = await _supabase.auth.getUser();
    var user = result.data.user;
    if (!user) return [];
    var res = await _supabase
        .from('profile_roles')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: true });
    if (res.error) return [];
    return res.data || [];
}

/**
 * Switch the active role. Pass null to revert to primary.
 */
async function switchRole(roleId) {
    var result = await _supabase.auth.getUser();
    var user = result.data.user;
    if (!user) return;
    await _supabase.from('profiles')
        .update({ active_role_id: roleId || null })
        .eq('id', user.id);
}

// ============================================================
// AUDIT LOG
// ============================================================

async function logAction(actor, action, target, details) {
    if (details === undefined) details = null;
    try {
        await _supabase.from('audit_log').insert([{
            actor_id:    actor.id,
            actor_name:  actor.full_name || 'UNKNOWN',
            action:      action,
            target_name: target || null,
            details:     details || null,
        }]);
    } catch (e) {
        console.warn('Audit log write failed:', e);
    }
}
