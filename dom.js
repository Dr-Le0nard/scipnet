// dom.js — small safe DOM helpers (XSS-resistant by default)

/**
 * Create an element with safe text content.
 * @param {string} tag
 * @param {string|null|undefined} text
 * @param {string|null|undefined} className
 * @returns {HTMLElement}
 */
function createSafeElement(tag, text, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
}

/**
 * Remove all children from an element.
 * @param {Element} el
 */
function clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

/**
 * Append a text node (safe) to a parent.
 * @param {Element} parent
 * @param {string|null|undefined} text
 */
function appendText(parent, text) {
    parent.appendChild(document.createTextNode(text === undefined || text === null ? '' : String(text)));
}

