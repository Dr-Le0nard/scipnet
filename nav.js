// nav.js — SCiPNET Shared Navigation
// Injects a consistent nav bar on every page based on the user's role.
// Add <script src="nav.js"></script> to every page and replace the
// hardcoded <nav class="main-nav"> with <nav class="main-nav" id="main-nav"></nav>

async function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    // Get current page filename to highlight the active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Fetch user profile for role-based links
    const { data: { user } } = await _supabase.auth.getUser();
    let isAdmin = false, isElevated = false;

    if (user) {
        const { data: profile } = await _supabase
            .from('profiles')
            .select('is_admin, is_overseer, is_terminal_admin')
            .eq('id', user.id)
            .maybeSingle();

        if (profile) {
            isAdmin = profile.is_admin || profile.is_overseer || profile.is_terminal_admin;
            isElevated = profile.is_overseer || profile.is_terminal_admin;
        }
    }

    // Base links visible to all authenticated users
    const links = [
        { href: 'dashboard.html', label: 'DASHBOARD' },
        { href: 'archive.html',   label: 'ARCHIVE' },
        { href: 'personnel.html', label: 'PERSONNEL' },
        { href: 'write.html',     label: 'NEW_REPORT' },
        { href: 'profile.html',   label: 'PROFILE' },
    ];

    // Admin link — only for admins and above
    if (isAdmin) {
        links.push({ href: 'admin.html', label: isElevated ? 'SYSTEM' : 'ADMIN' });
    }

    // Build nav HTML
    nav.innerHTML = links.map(link => {
        const isActive = currentPage === link.href ||
            // Mark write/edit as active for related pages
            (link.href === 'write.html' && (currentPage === 'write.html' || currentPage === 'edit.html'));
        return `<a href="${link.href}" ${isActive ? 'class="active"' : ''}>${link.label}</a>`;
    }).join('');
}

// Auto-run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}
