// toast.js — SCiPNET Terminal Toast Notification System

(function () {
    const style = document.createElement('style');
    style.textContent = `
        #toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        }
        .toast {
            font-family: 'Share Tech Mono', 'VT323', monospace;
            font-size: 0.78rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 10px 16px;
            border: 1px solid;
            background: rgba(2, 12, 2, 0.97);
            max-width: 360px;
            pointer-events: all;
            animation: toast-in 0.2s ease forwards;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        .toast::before {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            height: 2px;
            width: 100%;
        }
        .toast.success { color: #00ff41; border-color: rgba(0,255,65,0.35); }
        .toast.success::before { background: #00ff41; }
        .toast.error   { color: #ff3e3e; border-color: rgba(255,62,62,0.35); }
        .toast.error::before { background: #ff3e3e; }
        .toast.warning { color: #ffd700; border-color: rgba(255,215,0,0.35); }
        .toast.warning::before { background: #ffd700; }
        .toast.info    { color: rgba(0,255,65,0.6); border-color: rgba(0,255,65,0.15); }
        .toast.info::before { background: rgba(0,255,65,0.4); }
        .toast-prefix  { opacity: 0.5; margin-right: 6px; }
        .toast.leaving { animation: toast-out 0.3s ease forwards; }
        @keyframes toast-in  { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes toast-out { from { opacity:1; transform:translateX(0); }   to { opacity:0; transform:translateX(20px); } }
    `;
    document.head.appendChild(style);

    // Defer container creation until DOM is ready
    function getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    const PREFIXES  = { success:'[OK]', error:'[ERR]', warning:'[WARN]', info:'[INFO]' };
    const DURATIONS = { success:3000,   error:5000,    warning:4000,     info:3000 };

    window.toast = function (message, type = 'success', duration = null) {
        const ms = duration ?? DURATIONS[type] ?? 3000;
        const container = getContainer();

        const el = document.createElement('div');
        el.className = `toast ${type}`;
        // SECURITY: Never inject untrusted strings into HTML.
        // Prefix and message are separate nodes, both using textContent.
        const prefixEl = document.createElement('span');
        prefixEl.className = 'toast-prefix';
        prefixEl.textContent = PREFIXES[type] ?? PREFIXES.info;
        const msgEl = document.createElement('span');
        msgEl.textContent = message === undefined || message === null ? '' : String(message);
        el.appendChild(prefixEl);
        el.appendChild(msgEl);

        const uid = 't' + Date.now() + Math.random().toString(36).slice(2);
        el.classList.add(uid);
        const ks = document.createElement('style');
        ks.textContent = `.${uid}::before { animation: toast-timer-${uid} ${ms}ms linear forwards; }
            @keyframes toast-timer-${uid} { from{width:100%} to{width:0%} }`;
        document.head.appendChild(ks);

        container.appendChild(el);
        el.addEventListener('click', () => dismiss(el, ks));
        if (ms > 0) setTimeout(() => dismiss(el, ks), ms);
    };

    function dismiss(el, ks) {
        if (el.classList.contains('leaving')) return;
        el.classList.add('leaving');
        setTimeout(() => { el.remove(); if (ks) ks.remove(); }, 300);
    }

    // Override alert() globally
    window._nativeAlert = window.alert;
    window.alert = function (msg) {
        const m = (msg || '').toUpperCase();
        if (m.startsWith('ERROR') || m.startsWith('FAILED') || m.startsWith('ACCESS_DENIED') || m.startsWith('CRITICAL')) {
            window.toast(msg, 'error');
        } else if (m.startsWith('WARNING') || m.startsWith('WARN')) {
            window.toast(msg, 'warning');
        } else {
            window.toast(msg, 'success');
        }
    };
})();
