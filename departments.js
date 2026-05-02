// departments.js — SCiPNET Shared Department Registry

const DEPARTMENTS = [
    // Supreme Authority
    { value: 'OTA',     label: 'OFFICE OF THE ADMINISTRATOR (OTA)',  group: 'SUPREME AUTHORITY' },

    // Council
    { value: 'O5',      label: 'O5 COUNCIL',                         group: 'COUNCIL' },

    // Main Departments
    { value: 'ScD',     label: 'SCIENTIFIC DEPARTMENT (ScD)',        group: 'DEPARTMENTS' },
    { value: 'MD',      label: 'MEDICAL DEPARTMENT (MD)',            group: 'DEPARTMENTS' },
    { value: 'SD',      label: 'SECURITY DEPARTMENT (SD)',           group: 'DEPARTMENTS' },
    { value: 'SLMD',    label: 'SITE LOGISTICS AND MAINTENANCE (SLMD)', group: 'DEPARTMENTS' },
    { value: 'AD',      label: 'ADMINISTRATIVE DEPARTMENT (AD)',     group: 'DEPARTMENTS' },
    { value: 'DEA',     label: 'DEPT. OF EXTERNAL AFFAIRS (DEA)',    group: 'DEPARTMENTS' },
    { value: 'DoA',     label: 'DEPT. OF ADMISSIONS (DoA)',          group: 'DEPARTMENTS' },
    { value: 'ITD',     label: 'INTERNAL TRIBUNAL DEPT. (ITD)',      group: 'DEPARTMENTS' },

    // Intelligence
    { value: 'RAISA',   label: 'RAISA — INFOSEC (DSIS)',             group: 'INTELLIGENCE' },
    { value: 'DSIS',    label: 'DSIS — OPERATIONS',                  group: 'INTELLIGENCE' },

    // MTF
    { value: 'MTF-CMD', label: 'MTF COMMAND (MTF-CMD)',              group: 'MOBILE TASK FORCES' },
    { value: 'MTF-A1',  label: 'MTF a-1 "Red Right Hand"',           group: 'MOBILE TASK FORCES' },
    { value: 'MTF-X13', label: 'MTF x-13 "Sequere Nos"',             group: 'MOBILE TASK FORCES' },
    { value: 'MTF-T5',  label: 'MTF t-5 "Samsara"',                  group: 'MOBILE TASK FORCES' },
    { value: 'MTF-E11', label: 'MTF e-11 "Nine Tailed Fox"',         group: 'MOBILE TASK FORCES' },
    { value: 'MTF-B7',  label: 'MTF b-7 "Maz Hatters"',              group: 'MOBILE TASK FORCES' },
    { value: 'MTF-N7',  label: 'MTF n-7 "Hammer Down"',              group: 'MOBILE TASK FORCES' },

    { value: 'PRID',    label: 'PRISEC RESEARCH AND INNOVATION DEPARTMENT (PRID)', group: 'CONTRACTED UNITS' },
    { value: 'DEV',     label: 'DEVELOPMENT TEAM (DEV)',              group: 'CONTRACTED UNITS' },
];

DEPARTMENTS.forEach(function(d) {
    var labels = {
        'RAISA': 'RECORDKEEPING AND INFORMATION SECURITY ADMIN (RAISA)',
        'DSIS': 'DEPARTMENT OF STRATEGIC INTELLIGENCE SERVICES (DSIS)',
        'MTF-A1': 'MTF alpha-1 "Red Right Hand"',
        'MTF-X13': 'MTF xi-13 "Sequere Nos"',
        'MTF-T5': 'MTF tau-5 "Samsara"',
        'MTF-E11': 'MTF epsilon-11 "Nine Tailed Fox"',
        'MTF-B7': 'MTF beta-7 "Maz Hatters"',
        'MTF-N7': 'MTF nu-7 "Hammer Down"'
    };
    if (labels[d.value]) d.label = labels[d.value];
});

// Maps department to who oversees its access/role requests
const DEPT_OVERSEER_MAP = {
    'OTA':     'OTA',
    'O5':      'O5',
    'ScD':     'ScD',
    'MD':      'MD',
    'SD':      'SD',
    'SLMD':    'SLMD',
    'EcD':     'SLMD',
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
    'PRID':    'PRID',
    'DEV':     'DEV',
};

function normalizeDepartment(value) {
    if (value === 'EcD') return 'SLMD';
    return value;
}

/**
 * Returns true if the given profile can approve requests for the given department.
 */
function canApproveForDept(profile, dept) {
    if (profile.is_terminal_admin || profile.is_overseer) return true;
    if (!profile.is_admin) return false;
    var normalizedDept = normalizeDepartment(dept);
    var overseerDept = DEPT_OVERSEER_MAP[normalizedDept];
    var profileDept = normalizeDepartment(profile.department);
    return profileDept === overseerDept || profileDept === 'O5';
}

/**
 * Returns true if the profile has any kind of elevated/approval authority.
 */
function isElevatedUser(profile) {
    return profile.is_admin || profile.is_overseer || profile.is_terminal_admin;
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
            if (d.value === normalizeDepartment(selectedValue)) opt.selected = true;
            og.appendChild(opt);
        });
        sel.appendChild(og);
    });
}

function getDeptLabel(value) {
    var dept = DEPARTMENTS.find(function(d) { return d.value === normalizeDepartment(value); });
    return dept ? dept.label : value || 'UNASSIGNED';
}

function getDeptShort(value) {
    var labels = {
        'OTA':'OTA', 'O5':'O5',
        'ScD':'ScD', 'MD':'MD', 'SD':'SD', 'SLMD':'SLMD', 'EcD':'SLMD', 'AD':'AD',
        'DEA':'DEA', 'DoA':'DoA', 'ITD':'ITD', 'RAISA':'RAISA', 'DSIS':'DSIS',
        'MTF-CMD':'MTF-CMD',
        'MTF-A1':'MTF a-1', 'MTF-X13':'MTF x-13', 'MTF-T5':'MTF t-5',
        'MTF-E11':'MTF e-11', 'MTF-B7':'MTF b-7', 'MTF-N7':'MTF n-7',
        'PRID':'PRID',
        'DEV':'DEV',
    };
    return labels[normalizeDepartment(value)] || value || 'N/A';
}

// ============================================================
// ROLE CATALOG
// ============================================================

const ROLE_CATALOG = [];

function addRole(key, department, title, clearanceLevel, nicknamePrefix, authorityRank) {
    ROLE_CATALOG.push({
        key: key,
        department: department,
        title: title,
        clearanceLevel: clearanceLevel,
        nicknamePrefix: nicknamePrefix || '',
        authorityRank: authorityRank || clearanceLevel
    });
}

function slugRoleTitle(title) {
    return String(title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function titlePrefix(title, fallback) {
    var manual = {
        'O5': 'O5',
        'The Administrator': 'ADMIN',
        'Administrator': 'ADMIN',
        'Assistant Director': 'ADIR',
        'Director': 'DIR',
        'Head Developer': 'HDEV',
        'Head of Medicine': 'HOM',
        'Administrative Board': 'AB',
        'Task Force Leader': 'TFL',
        'Task Force Captain': 'TFC',
        'Task Force Lieutenant': 'TFLt',
        'Task Force Sergeant': 'TFS',
        'Junior Operative': 'JOPR',
        'Senior Operative': 'SOPR',
        'Court of Appeals': 'COA',
        'Court of General Claims': 'CGC',
        'Court of Justice': 'COJ',
        'Supreme Court': 'SC',
        'Foundation Public Defence Authority': 'FPDA',
        'Foundation Prosecutorial Authority': 'FPA'
    };
    if (manual[title]) return manual[title];
    var initials = String(title || '')
        .split(/\s+/)
        .filter(Boolean)
        .map(function(part) { return part.charAt(0).toUpperCase(); })
        .join('');
    return initials || fallback;
}

function inferredClearance(title, index, total) {
    if (title === 'O5') return 6;
    if (title === 'Overseer') return 6;
    if (title === 'The Administrator') return 8;
    if (title === 'Administrator') return 6;
    if (/^(Director|Operations Director|Head Developer|Head of Medicine|Chief Justice|Director of Research)$/.test(title)) return 5;
    if (/^(Assistant Director|Assistant Operations Director|Deputy Operations Director|Administrative Board|Scientific Councilor|Research Team Leader|Security Colonel|Security Commander|Chief Engineer|Chief Prosecutor|Chief Defender|Justice|Ambassador|Secretary|Project Lead|Head Researcher)$/.test(title)) return 4;
    if (/^(Task Force Leader|Task Force Captain|Task Force Lieutenant|Task Force Sergeant|Senior Operative|Lead Supervisory Agent|Intelligence Officer|Supervisor|Supervisory Agent|Senior|Lead|Chief|Manager|Specialized Doctor|Attending Physician|General Practitioner|Registered Nurse|Engineer|Engineer Manager|Prosecutor|Defender|Senior Prosecutor|Senior Defender|Clerk|Distinguished Researcher|Senior Researcher|Admissions Supervisor|Senior Admissions Officer|Research Specialist|Field Researcher)$/.test(title)) return 3;
    if (total <= 4 && index >= total - 2) return 4;
    if (index === 0) return 1;
    if (index < Math.ceil(total * 0.35)) return 2;
    if (index < Math.ceil(total * 0.70)) return 3;
    return 4;
}

const O5_DESIGNATION_MAP = {
    'DEA': 'O5-1',
    'SD': 'O5-2',
    'DoA': 'O5-3',
    'ScD': 'O5-4',
    'MTF-CMD': 'O5-5',
    'MD': 'O5-6',
    'ITD': 'O5-7',
    'SLMD': 'O5-8',
    'RAISA': 'O5-9',
    'DSIS': 'O5-10',
    'AD': 'O5-11'
};

function addDepartmentRoles(department, roles, prefixBase) {
    roles.forEach(function(title, index) {
        var clearance = inferredClearance(title, index, roles.length);
        var prefix = titlePrefix(title, prefixBase);
        if (title === 'O5') {
            var designation = O5_DESIGNATION_MAP[department] || 'O5';
            title = designation;
            if (department === 'DSIS') {
                clearance = 7;
                prefix = designation + ' / O5-X';
            } else {
                prefix = designation;
            }
        }
        addRole(
            department + '-' + slugRoleTitle(title),
            department,
            title,
            clearance,
            prefix + ' ~ ',
            clearance * 10 + index
        );
    });
}

addDepartmentRoles('RAISA', [
    'Probationary Agent', 'Agent', 'Supervisory Agent', 'Intelligence Officer',
    'Lead Supervisory Agent', 'Assistant Director', 'Director', 'O5'
], 'RAISA');

addDepartmentRoles('DSIS', [
    'Probationary Agent', 'Internal Agent', 'Special Agent', 'Supervisor',
    'Assistant Operations Director', 'Operations Director', 'O5'
], 'DSIS');

addDepartmentRoles('OTA', [
    'Analyst', 'Administrator', 'Secretary', 'The Administrator'
], 'OTA');

addRole('O5-council-member', 'O5', 'O5 Council Member', 6, 'O5 ~ ', 60);
addRole('O5-council-chairman', 'O5', 'O5 Council Chairman', 7, 'O5-X ~ ', 70);

addDepartmentRoles('AD', [
    'Junior Manager', 'Manager', 'Senior Manager', 'Assistant Director', 'Director', 'O5'
], 'AD');

addDepartmentRoles('MD', [
    'Medical Intern', 'Resident', 'Nurse Practitioner', 'Registered Nurse',
    'General Practitioner', 'Attending Physician', 'Specialized Doctor',
    'Administrative Board', 'Head of Medicine', 'Assistant Director', 'Director', 'O5'
], 'MD');

addDepartmentRoles('SLMD', [
    'Apprentice Technician', 'Technician', 'Lead Technician', 'Engineer',
    'Engineer Manager', 'Chief Engineer', 'Deputy Operations Director',
    'Operations Director', 'O5'
], 'SLMD');

addDepartmentRoles('ITD', [
    'Student Prosecutor', 'Student Defender', 'Assistant Prosecutor', 'Assistant Defender',
    'Prosecutor', 'Defender', 'Senior Prosecutor', 'Senior Defender',
    'Chief Prosecutor', 'Chief Defender', 'Clerk', 'Justice', 'Chief Justice',
    'Foundation Public Defence Authority', 'Foundation Prosecutorial Authority',
    'Court of Justice', 'Court of Appeals', 'Court of General Claims', 'Supreme Court',
    'Assistant Director', 'Director', 'O5'
], 'ITD');

addDepartmentRoles('DoA', [
    'Admissions Officer', 'Senior Admissions Officer', 'Admissions Supervisor',
    'Assistant Director', 'Director', 'O5'
], 'DoA');

addDepartmentRoles('SD', [
    'Security Cadet', 'Security Private', 'Security Sentry', 'Security Platoon Corporal',
    'Security Platoon Sergeant', 'Security Sergeant', 'Security Lieutenant',
    'Security Captain', 'Security Major', 'Security Commander', 'Security Colonel',
    'Assistant Director', 'Director', 'O5'
], 'SD');

addDepartmentRoles('ScD', [
    'Probationary Researcher', 'Novice Researcher', 'Researcher', 'Senior Researcher',
    'Distinguished Researcher', 'Research Team Leader', 'Scientific Councilor',
    'Assistant Director', 'Director', 'O5'
], 'ScD');

addDepartmentRoles('DEA', [
    'Intern', 'Diplomat', 'Emissary', 'Manager', 'Attache', 'Ambassador',
    'Secretary', 'Assistant Director', 'Director', 'O5'
], 'DEA');

['MTF-A1','MTF-E11','MTF-B7','MTF-N7','MTF-X13','MTF-T5'].forEach(function(department) {
    addDepartmentRoles(department, [
        'Recruit', 'Junior Operative', 'Operative', 'Senior Operative',
        'Task Force Sergeant', 'Task Force Lieutenant', 'Task Force Captain',
        'Task Force Leader'
    ], getDeptShort(department).replace(/\s+/g, '').toUpperCase());
});

addDepartmentRoles('MTF-CMD', [
    'Assistant Director', 'Director', 'O5'
], 'MTF-CMD');

addDepartmentRoles('PRID', [
    'Trainee Researcher', 'Junior Researcher', 'Field Researcher',
    'Research Specialist', 'Senior Researcher', 'Head Researcher',
    'Project Lead', 'Director of Research', 'Overseer'
], 'PRID');

addDepartmentRoles('DEV', [
    'Candidate', 'Architectonic Branch', 'Modelling Branch', 'Scripting Branch',
    'Music Branch', 'UI Branch', 'SFX Branch', 'Architectonic Lead',
    'Modelling Lead', 'Scripting Lead', 'Music Lead', 'UI Lead', 'SFX Lead',
    'Head Developer'
], 'DEV');

function getRoleByKey(roleKey) {
    return ROLE_CATALOG.find(function(r) { return r.key === roleKey; }) || null;
}

function getRolesForDept(dept) {
    dept = normalizeDepartment(dept);
    return ROLE_CATALOG
        .filter(function(r) { return r.department === dept; })
        .sort(function(a, b) {
            return (b.authorityRank - a.authorityRank) || a.title.localeCompare(b.title);
        });
}

function getVisibleRolesForApprover(profile, dept) {
    var maxLevel = profile && (profile.is_overseer || profile.is_terminal_admin) ? 8 : (profile && profile.clearance_level) || 0;
    return getRolesForDept(dept).filter(function(r) { return r.clearanceLevel <= maxLevel; });
}

function stripKnownRolePrefix(name) {
    var value = String(name || '').trim();
    ROLE_CATALOG
        .map(function(r) { return r.nicknamePrefix; })
        .filter(Boolean)
        .sort(function(a, b) { return b.length - a.length; })
        .some(function(prefix) {
            if (value.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {
                value = value.slice(prefix.length).trim();
                return true;
            }
            return false;
        });
    return value;
}

function getProfileBaseName(profile) {
    return (profile && profile.base_name) || stripKnownRolePrefix(profile && profile.full_name) || (profile && profile.full_name) || '';
}

function getRoleBaseName(role) {
    return (role && role.base_name) || stripKnownRolePrefix(role && role.role_name) || (role && role.role_name) || '';
}

function formatRoleDisplayName(baseName, roleDef) {
    var clean = stripKnownRolePrefix(baseName);
    if (!clean) clean = 'UNKNOWN';
    if (!roleDef || !roleDef.nicknamePrefix) return clean;
    return roleDef.nicknamePrefix + clean;
}

function getRoleLabel(roleDef) {
    if (!roleDef) return 'LEGACY ROLE';
    return roleDef.title + ' [' + getDeptShort(roleDef.department) + '] CL' + roleDef.clearanceLevel;
}

function populateRoleSelect(selectId, selectedValue, options) {
    options = options || {};
    var sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    if (options.includeBlank !== false) {
        var blank = document.createElement('option');
        blank.value = '';
        blank.text = options.blankLabel || '-- SELECT ROLE --';
        sel.appendChild(blank);
    }
    var roles = options.roles || ROLE_CATALOG;
    var groups = {};
    roles.forEach(function(role) {
        var deptLabel = getDeptShort(role.department);
        if (!groups[deptLabel]) groups[deptLabel] = [];
        groups[deptLabel].push(role);
    });
    Object.entries(groups).forEach(function(entry) {
        var og = document.createElement('optgroup');
        og.label = entry[0];
        entry[1]
            .sort(function(a, b) { return (b.authorityRank - a.authorityRank) || a.title.localeCompare(b.title); })
            .forEach(function(role) {
                var opt = document.createElement('option');
                opt.value = role.key;
                opt.text = role.title + ' - CL' + role.clearanceLevel;
                if (role.key === selectedValue) opt.selected = true;
                og.appendChild(opt);
            });
        sel.appendChild(og);
    });
}
