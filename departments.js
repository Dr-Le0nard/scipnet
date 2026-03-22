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
    { value: 'DSIS',    label: 'DSIS — OPERATIONS',                  group: 'INTELLIGENCE' },

    // MTF
    { value: 'MTF-CMD', label: 'MTF COMMAND (MTF-CMD)',              group: 'MOBILE TASK FORCES' },
    { value: 'MTF-A1',  label: 'MTF a-1 "Red Right Hand"',          group: 'MOBILE TASK FORCES' },
    { value: 'MTF-X13', label: 'MTF x-13 "Sequere Nos"',            group: 'MOBILE TASK FORCES' },
    { value: 'MTF-T5',  label: 'MTF t-5 "Samsara"',                 group: 'MOBILE TASK FORCES' },
    { value: 'MTF-E11', label: 'MTF e-11 "Nine Tailed Fox"',        group: 'MOBILE TASK FORCES' },
    { value: 'MTF-B7',  label: 'MTF b-7 "Maz Hatters"',             group: 'MOBILE TASK FORCES' },
    { value: 'MTF-N7',  label: 'MTF n-7 "Hammer Down"',             group: 'MOBILE TASK FORCES' },

    // External Contractors
    { value: 'PRID',    label: 'PRISEC RESEARCH & INNOVATION (PRID)', group: 'CONTRACTED UNITS' },
];

// Maps department to who oversees its access/role requests
// PRID uses 'PRID_DIRECTOR' as a special sentinel — handled separately in app logic
const DEPT_OVERSEER_MAP = {
    'OTA':     'OTA',
    'O5':      'O5',
    'ScD':     'ScD',
    'MD':      'MD',
    'SD':      'SD',
    'EcD':     'EcD',
    'AD':      'AD',
    'DEA':     'DEA',
    'DoA':     'DoA',
    'ITD':     'ITD',
    'RAISA':   'RAISA',
    'DSIS':    'DSIS',
    'MTF-CMD': 'MTF-CMD',
    'MTF-A1':  'MTF-CMD',
    'MTF-X13': 'MTF-CMD',
    'MTF-T5':  'MTF-CMD',
    'MTF-E11': 'MTF-CMD',
    'MTF-B7':  'MTF-CMD',
    'MTF-N7':  'MTF-CMD',
    'PRID':    'PRID_DIRECTOR',
};

/**
 * Returns true if the given profile can approve requests for the given department.
 * Handles both O5 admins and the PRID Director.
 */
function canApproveForDept(profile, dept) {
    if (profile.is_terminal_admin || profile.is_overseer) return true;
    if (dept === 'PRID') return profile.is_prid_director === true;
    if (!profile.is_admin) return false;
    var overseerDept = DEPT_OVERSEER_MAP[dept];
    return profile.department === overseerDept || profile.department === 'O5';
}

/**
 * Returns true if the profile has any kind of elevated/approval authority.
 */
function isElevatedUser(profile) {
    return profile.is_admin || profile.is_overseer || profile.is_terminal_admin || profile.is_prid_director;
}

function populateDeptSelect(selectId, selectedValue, includeBlank, includeO5) {
    if (includeBlank === undefined) includeBlank = true;
    if (includeO5 === undefined) includeO5 = false;
    var sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    if (includeBlank) {
        var blank = document.createElement('option');
        blank.value = ''; blank.text = '-- SELECT UNIT --';
        sel.appendChild(blank);
    }
    var groups = {};
    DEPARTMENTS.forEach(function(d) {
        if (!includeO5 && d.value === 'O5') return;
        if (!groups[d.group]) groups[d.group] = [];
        groups[d.group].push(d);
    });
    Object.entries(groups).forEach(function(entry) {
        var groupName = entry[0], depts = entry[1];
        var og = document.createElement('optgroup');
        og.label = groupName;
        depts.forEach(function(d) {
            var opt = document.createElement('option');
            opt.value = d.value; opt.text = d.label;
            if (d.value === selectedValue) opt.selected = true;
            og.appendChild(opt);
        });
        sel.appendChild(og);
    });
}

function getDeptLabel(value) {
    var dept = DEPARTMENTS.find(function(d) { return d.value === value; });
    return dept ? dept.label : value || 'UNASSIGNED';
}

function getDeptShort(value) {
    var labels = {
        'OTA':'OTA', 'O5':'O5',
        'ScD':'ScD', 'MD':'MD', 'SD':'SD', 'EcD':'EcD', 'AD':'AD',
        'DEA':'DEA', 'DoA':'DoA', 'ITD':'ITD', 'RAISA':'RAISA', 'DSIS':'DSIS',
        'MTF-CMD':'MTF-CMD',
        'MTF-A1':'MTF a-1', 'MTF-X13':'MTF x-13', 'MTF-T5':'MTF t-5',
        'MTF-E11':'MTF e-11', 'MTF-B7':'MTF b-7', 'MTF-N7':'MTF n-7',
        'PRID':'PRID',
    };
    return labels[value] || value || 'N/A';
}