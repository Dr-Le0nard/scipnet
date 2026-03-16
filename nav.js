// nav.js — SCiPNET Shared Navigation
// Requires config.js to be loaded first (needs _supabase)

async function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    let isAdmin = false, isElevated = false;

    try {
        const { data: { user } } = await _supabase.auth.getUser();
        if (user) {
            const { data: profile } = await _supabase
                .from('profiles')
                .select('is_admin, is_overseer, is_terminal_admin')
                .eq('id', user.id)
                .maybeSingle();

            if (profile) {
                isAdmin   = profile.is_admin || profile.is_overseer || profile.is_terminal_admin;
                isElevated = profile.is_overseer || profile.is_terminal_admin;
            }
        }
    } catch (e) {
        // If auth fails, still render base nav
    }

    const links = [
        { href: 'dashboard.html', label: 'DASHBOARD' },
        { href: 'archive.html',   label: 'ARCHIVE' },
        { href: 'personnel.html', label: 'PERSONNEL' },
        { href: 'write.html',     label: 'NEW_REPORT' },
        { href: 'profile.html',   label: 'PROFILE' },
    ];

    if (isAdmin) {
        links.push({ href: 'admin.html', label: isElevated ? 'SYSTEM' : 'ADMIN' });
    }

    nav.innerHTML = links.map(link => {
        const isActive = currentPage === link.href ||
            (link.href === 'write.html' && (currentPage === 'write.html' || currentPage === 'edit.html'));
        return `<a href="${link.href}"${isActive ? ' class="active"' : ''}>${link.label}</a>`;
    }).join('');
}

// Wait for DOM to be ready before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}
