// departments.js — SCiPNET Shared Department Registry
// Single source of truth for all department/MTF dropdowns across the site.

const DEPARTMENTS = [
    // O5 Council
    { value: 'O5',      label: 'O5 COUNCIL',                      group: 'COUNCIL' },

    // Main Departments
    { value: 'ScD',     label: 'SCIENTIFIC DEPARTMENT (ScD)',      group: 'DEPARTMENTS' },
    { value: 'MD',      label: 'MEDICAL DEPARTMENT (MD)',          group: 'DEPARTMENTS' },
    { value: 'SD',      label: 'SECURITY DEPARTMENT (SD)',         group: 'DEPARTMENTS' },
    { value: 'EcD',     label: 'ENGINEERING & MAINTENANCE (EcD)',  group: 'DEPARTMENTS' },
    { value: 'AD',      label: 'ADMINISTRATIVE DEPARTMENT (AD)',   group: 'DEPARTMENTS' },
    { value: 'DEA',     label: 'DEPT. OF EXTERNAL AFFAIRS (DEA)', group: 'DEPARTMENTS' },
    { value: 'DoA',     label: 'DEPT. OF ADMISSIONS (DoA)',       group: 'DEPARTMENTS' },
    { value: 'ITD',     label: 'INTERNAL TRIBUNAL DEPT. (ITD)',   group: 'DEPARTMENTS' },

    // Intelligence
    { value: 'RAISA',   label: 'RAISA — INFOSEC (DSIS)',          group: 'INTELLIGENCE' },
    { value: 'ISD',     label: 'DSIS — OPERATIONS (ISD)',         group: 'INTELLIGENCE' },

    // MTF Branches
    { value: 'MTF-A1',  label: 'MTF α-1 "Red Right Hand"',        group: 'MOBILE TASK FORCES' },
    { value: 'MTF-X13', label: 'MTF ξ-13 "Sequere Nos"',          group: 'MOBILE TASK FORCES' },
    { value: 'MTF-T5',  label: 'MTF τ-5 "Samsara"',               group: 'MOBILE TASK FORCES' },
    { value: 'MTF-E11', label: 'MTF ε-11 "Nine Tailed Fox"',      group: 'MOBILE TASK FORCES' },
    { value: 'MTF-B7',  label: 'MTF β-7 "Maz Hatters"',           group: 'MOBILE TASK FORCES' },
    { value: 'MTF-N7',  label: 'MTF ν-7 "Hammer Down"',           group: 'MOBILE TASK FORCES' },
];

/**
 * Renders a full grouped <optgroup> department dropdown into a <select> element.
 * @param {string} selectId - The id of the <select> element to populate
 * @param {string|null} selectedValue - The value to pre-select
 * @param {boolean} includeBlank - Whether to include a blank "-- SELECT --" option
 * @param {boolean} includeO5 - Whether to include the O5 Council option
 */
function populateDeptSelect(selectId, selectedValue = null, includeBlank = true, includeO5 = false) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    sel.innerHTML = '';

    if (includeBlank) {
        const blank = document.createElement('option');
        blank.value = '';
        blank.text  = '-- SELECT UNIT --';
        sel.appendChild(blank);
    }

    // Group departments
    const groups = {};
    DEPARTMENTS.forEach(d => {
        if (!includeO5 && d.value === 'O5') return;
        if (!groups[d.group]) groups[d.group] = [];
        groups[d.group].push(d);
    });

    Object.entries(groups).forEach(([groupName, depts]) => {
        const og = document.createElement('optgroup');
        og.label = groupName;
        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value   = d.value;
            opt.text    = d.label;
            if (d.value === selectedValue) opt.selected = true;
            og.appendChild(opt);
        });
        sel.appendChild(og);
    });
}

/**
 * Returns the full label for a department value.
 * @param {string} value
 * @returns {string}
 */
function getDeptLabel(value) {
    const dept = DEPARTMENTS.find(d => d.value === value);
    return dept ? dept.label : value || 'UNASSIGNED';
}

/**
 * Returns just the short code/abbreviation for display.
 * e.g. 'MTF-E11' → 'MTF ε-11'
 */
function getDeptShort(value) {
    const labels = {
        'ScD':    'ScD',   'MD':     'MD',    'SD':     'SD',
        'EcD':    'EcD',   'AD':     'AD',    'DEA':    'DEA',
        'DoA':    'DoA',   'ITD':    'ITD',   'RAISA':  'RAISA',
        'ISD':    'ISD',   'O5':     'O5',
        'MTF-A1': 'MTF α-1', 'MTF-X13':'MTF ξ-13', 'MTF-T5': 'MTF τ-5',
        'MTF-E11':'MTF ε-11','MTF-B7': 'MTF β-7',  'MTF-N7': 'MTF ν-7',
    };
    return labels[value] || value || 'N/A';
}
