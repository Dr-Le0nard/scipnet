// modal.js — SCiPNET Styled Confirmation Modal

(function () {
    const style = document.createElement('style');
    style.textContent = `
        #modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 99990;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        }
        #modal-overlay.visible {
            display: flex;
        }
        #modal-box {
            border: 1px solid rgba(0,255,65,0.35);
            background: rgba(2, 12, 2, 0.98);
            padding: 28px 32px;
            max-width: 480px;
            width: 90%;
            position: relative;
            box-shadow: 0 0 40px rgba(0,255,65,0.1);
            animation: modal-in 0.2s ease forwards;
        }
        #modal-box.danger {
            border-color: rgba(255,62,62,0.4);
            box-shadow: 0 0 40px rgba(255,62,62,0.08);
        }
        @keyframes modal-in {
            from { opacity:0; transform:translateY(-12px); }
            to   { opacity:1; transform:translateY(0); }
        }
        #modal-title {
            font-family: 'VT323', monospace;
            font-size: 1.3rem;
            letter-spacing: 3px;
            color: #00ff41;
            margin-bottom: 10px;
        }
        #modal-box.danger #modal-title { color: #ff3e3e; }
        #modal-message {
            font-family: 'Share Tech Mono', monospace;
            font-size: 0.8rem;
            color: rgba(0,255,65,0.6);
            letter-spacing: 0.05em;
            line-height: 1.6;
            margin-bottom: 24px;
            text-transform: uppercase;
        }
        #modal-box.danger #modal-message { color: rgba(255,62,62,0.6); }
        #modal-divider {
            border: none;
            border-top: 1px solid rgba(0,255,65,0.15);
            margin-bottom: 20px;
        }
        #modal-box.danger #modal-divider { border-color: rgba(255,62,62,0.15); }
        #modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .modal-btn {
            font-family: 'VT323', monospace;
            font-size: 1rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 6px 20px;
            border: 1px solid;
            background: transparent;
            cursor: pointer;
            transition: all 0.15s;
        }
        .modal-btn-cancel {
            color: rgba(0,255,65,0.5);
            border-color: rgba(0,255,65,0.2);
        }
        .modal-btn-cancel:hover {
            color: #00ff41;
            border-color: rgba(0,255,65,0.5);
            background: rgba(0,255,65,0.05);
        }
        .modal-btn-confirm {
            color: #00ff41;
            border-color: rgba(0,255,65,0.4);
        }
        .modal-btn-confirm:hover {
            background: rgba(0,255,65,0.15);
            box-shadow: 0 0 10px rgba(0,255,65,0.2);
        }
        .modal-btn-danger {
            color: #ff3e3e;
            border-color: rgba(255,62,62,0.4);
        }
        .modal-btn-danger:hover {
            background: rgba(255,62,62,0.1);
            box-shadow: 0 0 10px rgba(255,62,62,0.2);
        }
    `;
    document.head.appendChild(style);

    // Build DOM
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `
        <div id="modal-box">
            <div id="modal-title">CONFIRM_ACTION</div>
            <hr id="modal-divider">
            <div id="modal-message"></div>
            <div id="modal-buttons"></div>
        </div>`;
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', e => { if (e.target === overlay) _resolveModal(false); });

    let _resolveModal = () => {};

    /**
     * Show a styled confirmation modal.
     * @param {string} message - The confirmation message
     * @param {object} options - { title, confirmText, cancelText, danger }
     * @returns {Promise<boolean>}
     */
    window.showModal = function (message, options = {}) {
        const {
            title       = 'CONFIRM_ACTION',
            confirmText = 'CONFIRM',
            cancelText  = 'CANCEL',
            danger      = false
        } = options;

        const box     = document.getElementById('modal-box');
        const titleEl = document.getElementById('modal-title');
        const msgEl   = document.getElementById('modal-message');
        const btnsEl  = document.getElementById('modal-buttons');

        titleEl.innerText = title;
        msgEl.innerText   = message;
        box.className     = danger ? 'danger' : '';

        btnsEl.innerHTML = `
            <button class="modal-btn modal-btn-cancel" id="modal-cancel">${cancelText}</button>
            <button class="modal-btn ${danger ? 'modal-btn-danger' : 'modal-btn-confirm'}" id="modal-confirm">${confirmText}</button>
        `;

        overlay.classList.add('visible');

        return new Promise(resolve => {
            _resolveModal = (result) => {
                overlay.classList.remove('visible');
                resolve(result);
            };
            document.getElementById('modal-confirm').onclick = () => _resolveModal(true);
            document.getElementById('modal-cancel').onclick  = () => _resolveModal(false);
        });
    };

    // Override native confirm()
    window._nativeConfirm = window.confirm;
    window.confirm = function (msg) {
        console.warn('Native confirm() called — use showModal() for styled dialogs.');
        return window._nativeConfirm(msg);
    };
})();
