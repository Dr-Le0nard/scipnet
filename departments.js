// departments.js — SCiPNET Shared Department Registry

const DEPARTMENTS = [
    // Supreme Authority
    { value: 'OTA',     label: 'OFFICE OF THE ADMINISTRATOR (OTA)', group: 'SUPREME AUTHORITY' },

    // Council
    { value: 'O5',      label: 'O5 COUNCIL',                        group: 'COUNCIL' },

    // Main Departments
    { value: 'ScD',     label: 'SCIENTIFIC DEPARTMENT (ScD)',        group: 'DEPARTMENTS' },
    { value: 'MD',      label: 'MEDICAL DEPARTMENT (MD)',            group: 'DEPARTMENTS' },
    { value: 'SD',      label: 'SECURITY DEPARTMENT (SD)',           group: 'DEPARTMENTS' },
    { value: 'EcD',     label: 'ENGINEERING & MAINTENANCE (EcD)',    group: 'DEPARTMENTS' },
    { value: 'AD',      label: 'ADMINISTRATIVE DEPARTMENT (AD)',     group: 'DEPARTMENTS' },
    { value: 'DEA',     label: 'DEPT. OF EXTERNAL AFFAIRS (DEA)',    group: 'DEPARTMENTS' },
    { value: 'DoA',     label: 'DEPT. OF ADMISSIONS (DoA)',          group: 'DEPARTMENTS' },
    { value: 'ITD',     label: 'INTERNAL TRIBUNAL DEPT. (ITD)',      group: 'DEPARTMENTS' },

    // Intelligence
    { value: 'RAISA',   label: 'RAISA — INFOSEC (DSIS)',             group: 'INTELLIGENCE' },
    { value: 'ISD',     label: 'DSIS — OPERATIONS (ISD)',            group: 'INTELLIGENCE' },

    // MTF
    { value: 'MTF-CMD', label: 'MTF COMMAND (MTF-CMD)',              group: 'MOBILE TASK FORCES' },
    { value: 'MTF-A1',  label: 'MTF α-1 "Red Right Hand"',          group: 'MOBILE TASK FORCES' },
    { value: 'MTF-X13', label: 'MTF ξ-13 "Sequere Nos"',            group: 'MOBILE TASK FORCES' },
    { value: 'MTF-T5',  label: 'MTF τ-5 "Samsara"',                 group: 'MOBILE TASK FORCES' },
    { value: 'MTF-E11', label: 'MTF ε-11 "Nine Tailed Fox"',        group: 'MOBILE TASK FORCES' },
    { value: 'MTF-B7',  label: 'MTF β-7 "Maz Hatters"',             group: 'MOBILE TASK FORCES' },
    { value: 'MTF-N7',  label: 'MTF ν-7 "Hammer Down"',             group: 'MOBILE TASK FORCES' },
];

// Departments where requests are approved by their O5 overseer
// Maps department value → which O5 department oversees it
const DEPT_OVERSEER_MAP = {
    'ScD':     'ScD',
    'MD':      'MD',
    'SD':      'SD',
    'EcD':     'EcD',
    'AD':      'AD',
    'DEA':     'DEA',
    'DoA':     'DoA',
    'ITD':     'ITD',
    'RAISA':   'RAISA',
    'ISD':     'ISD',
    'MTF-CMD': 'MTF-CMD',
    'MTF-A1':  'MTF-CMD',
    'MTF-X13': 'MTF-CMD',
    'MTF-T5':  'MTF-CMD',
    'MTF-E11': 'MTF-CMD',
    'MTF-B7':  'MTF-CMD',
    'MTF-N7':  'MTF-CMD',
    'O5':      'O5',
    'OTA':     'OTA',
};

/**
 * Returns true if the given profile can approve a role request for the given department.
 */
function canApproveForDept(profile, dept) {
    if (profile.is_terminal_admin || profile.is_overseer) return true;
    if (!profile.is_admin) return false;
    // O5 can approve for their own overseen department
    const overseerDept = DEPT_OVERSEER_MAP[dept];
    return profile.department === overseerDept || profile.department === 'O5';
}

function populateDeptSelect(selectId, selectedValue = null, includeBlank = true, includeO5 = false) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    if (includeBlank) {
        const blank = document.createElement('option');
        blank.value = ''; blank.text = '-- SELECT UNIT --';
        sel.appendChild(blank);
    }
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
            opt.value = d.value; opt.text = d.label;
            if (d.value === selectedValue) opt.selected = true;
            og.appendChild(opt);
        });
        sel.appendChild(og);
    });
}

function getDeptLabel(value) {
    const dept = DEPARTMENTS.find(d => d.value === value);
    return dept ? dept.label : value || 'UNASSIGNED';
}

function getDeptShort(value) {
    const labels = {
        'OTA':'OTA', 'O5':'O5',
        'ScD':'ScD', 'MD':'MD', 'SD':'SD', 'EcD':'EcD', 'AD':'AD',
        'DEA':'DEA', 'DoA':'DoA', 'ITD':'ITD', 'RAISA':'RAISA', 'ISD':'ISD',
        'MTF-CMD':'MTF-CMD',
        'MTF-A1':'MTF α-1', 'MTF-X13':'MTF ξ-13', 'MTF-T5':'MTF τ-5',
        'MTF-E11':'MTF ε-11', 'MTF-B7':'MTF β-7', 'MTF-N7':'MTF ν-7',
    };
    return labels[value] || value || 'N/A';
}
