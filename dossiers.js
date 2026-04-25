const DEPARTMENT_SCD = "Scientific Department";

const DOSSIER_STATUSES = {
  PENDING: "Pending Approval",
  APPROVED: "Approved"
};

const OBJECT_CLASSES = ["Safe", "Euclid", "Keter", "Apollyon"];

class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = "PermissionError";
  }
}

class ScDUser {
  constructor({ name, clearanceLevel, department = DEPARTMENT_SCD }) {
    this.name = name;
    this.clearanceLevel = clearanceLevel;
    this.department = department;
  }

  get isScD() {
    return this.department === 'ScD';
  }

  get isCL4Plus() {
    return this.isScD && this.clearanceLevel >= 4;
  }
}

function requireScDAccess(user) {
  if (!(user instanceof ScDUser) || !user.isScD) {
    throw new PermissionError("Access denied: only ScD personnel may use the DOSSIERS repository.");
  }
}

function requireCL4(user) {
  requireScDAccess(user);
  if (!user.isCL4Plus) {
    throw new PermissionError("Action denied: only ScD personnel with Clearance Level 4 or higher may perform this operation.");
  }
}

function makeUniqueId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

class TestLogEntry {
  constructor({ personnel, procedure, result, testId = makeUniqueId("test") }) {
    this.testId = testId;
    this.personnel = personnel;
    this.procedure = procedure;
    this.result = result;
    this.createdAt = new Date().toISOString();
  }

  update(updates) {
    if (updates.personnel !== undefined) this.personnel = updates.personnel;
    if (updates.procedure !== undefined) this.procedure = updates.procedure;
    if (updates.result !== undefined) this.result = updates.result;
  }
}

class IncidentReport {
  constructor({ date, units, cause, resolution, preventionNotes, reportId = makeUniqueId("incident") }) {
    this.reportId = reportId;
    this.date = date;
    this.units = units;
    this.cause = cause;
    this.resolution = resolution;
    this.preventionNotes = preventionNotes;
    this.createdAt = new Date().toISOString();
  }

  update(updates) {
    if (updates.date !== undefined) this.date = updates.date;
    if (updates.units !== undefined) this.units = updates.units;
    if (updates.cause !== undefined) this.cause = updates.cause;
    if (updates.resolution !== undefined) this.resolution = updates.resolution;
    if (updates.preventionNotes !== undefined) this.preventionNotes = updates.preventionNotes;
  }
}

class DossierDocument {
  constructor({ designation, objectClass, clearanceLevel, author, ownerId = null, createdBy = null, updatedBy = null, description, containmentProcedures, recontainmentProcedures, status = DOSSIER_STATUSES.PENDING, testLogs = [], incidentReports = [] }) {
    if (!designation || !objectClass || clearanceLevel === undefined || !author) {
      throw new Error("Missing required DOSSIER fields: designation, objectClass, clearanceLevel, author.");
    }
    if (!OBJECT_CLASSES.includes(objectClass)) {
      throw new Error(`Invalid object class '${objectClass}'. Valid classes: ${OBJECT_CLASSES.join(", ")}`);
    }

    this.designation = designation;
    this.objectClass = objectClass;
    this.clearanceLevel = clearanceLevel;
    this.status = status;
    this.author = author;
    this.ownerId = ownerId;
    this.createdBy = createdBy || author;
    this.updatedBy = updatedBy || author;
    this.description = description || "";
    this.containmentProcedures = containmentProcedures || "";
    this.recontainmentProcedures = recontainmentProcedures || "";
    this.testLogs = testLogs.map((log) => (log instanceof TestLogEntry ? log : new TestLogEntry(log)));
    this.incidentReports = incidentReports.map((report) => (report instanceof IncidentReport ? report : new IncidentReport(report)));
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  approve(user) {
    requireCL4(user);
    this.status = DOSSIER_STATUSES.APPROVED;
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
  }

  edit(user, updates = {}) {
    requireCL4(user);
    const editableFields = [
      "objectClass",
      "clearanceLevel",
      "description",
      "containmentProcedures",
      "recontainmentProcedures",
      "author"
    ];

    editableFields.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === "objectClass" && !OBJECT_CLASSES.includes(updates[field])) {
          throw new Error(`Invalid object class '${updates[field]}'.`);
        }
        this[field] = updates[field];
      }
    });

    if (updates.status !== undefined) {
      this.status = updates.status;
    }

    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
  }

  addTestLog(user, logData) {
    requireScDAccess(user);
    const entry = new TestLogEntry(logData);
    this.testLogs.push(entry);
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
    return entry;
  }

  addIncidentReport(user, reportData) {
    requireScDAccess(user);
    const entry = new IncidentReport(reportData);
    this.incidentReports.push(entry);
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
    return entry;
  }

  updateTestLog(user, testId, updates) {
    requireCL4(user);
    const entry = this.testLogs.find((log) => log.testId === testId);
    if (!entry) {
      throw new Error(`Test log '${testId}' not found.`);
    }
    entry.update(updates);
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
    return entry;
  }

  deleteTestLog(user, testId) {
    requireCL4(user);
    const index = this.testLogs.findIndex((log) => log.testId === testId);
    if (index === -1) {
      throw new Error(`Test log '${testId}' not found.`);
    }
    const [deleted] = this.testLogs.splice(index, 1);
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
    return deleted;
  }

  updateIncidentReport(user, reportId, updates) {
    requireCL4(user);
    const entry = this.incidentReports.find((report) => report.reportId === reportId);
    if (!entry) {
      throw new Error(`Incident report '${reportId}' not found.`);
    }
    entry.update(updates);
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
    return entry;
  }

  deleteIncidentReport(user, reportId) {
    requireCL4(user);
    const index = this.incidentReports.findIndex((report) => report.reportId === reportId);
    if (index === -1) {
      throw new Error(`Incident report '${reportId}' not found.`);
    }
    const [deleted] = this.incidentReports.splice(index, 1);
    this.updatedBy = user.name;
    this.updatedAt = new Date().toISOString();
    return deleted;
  }

  get isOfficial() {
    return this.status === DOSSIER_STATUSES.APPROVED;
  }

  summary() {
    return {
      designation: this.designation,
      objectClass: this.objectClass,
      clearanceLevel: this.clearanceLevel,
      status: this.status,
      official: this.isOfficial,
      author: this.author,
      description: this.description,
      containmentProcedures: this.containmentProcedures,
      recontainmentProcedures: this.recontainmentProcedures,
      testLogCount: this.testLogs.length,
      incidentReportCount: this.incidentReports.length,
      lastUpdated: this.updatedAt
    };
  }

  toJSON() {
    return {
      designation: this.designation,
      objectClass: this.objectClass,
      clearanceLevel: this.clearanceLevel,
      status: this.status,
      author: this.author,
      ownerId: this.ownerId,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      description: this.description,
      containmentProcedures: this.containmentProcedures,
      recontainmentProcedures: this.recontainmentProcedures,
      testLogs: this.testLogs.map((log) => ({
        testId: log.testId,
        personnel: log.personnel,
        procedure: log.procedure,
        result: log.result,
        createdAt: log.createdAt
      })),
      incidentReports: this.incidentReports.map((report) => ({
        reportId: report.reportId,
        date: report.date,
        units: report.units,
        cause: report.cause,
        resolution: report.resolution,
        preventionNotes: report.preventionNotes,
        createdAt: report.createdAt
      })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

class DossierRepository {
  constructor(entries = []) {
    this.documents = new Map();
    entries.forEach((entry) => {
      const document = entry instanceof DossierDocument ? entry : new DossierDocument(entry);
      this.documents.set(document.designation, document);
    });
  }

  requireScDAccess(user) {
    requireScDAccess(user);
  }

  createDocument(user, documentData) {
    requireScDAccess(user);
    const data = {
      ...documentData,
      status: DOSSIER_STATUSES.PENDING,
      author: documentData.author || user.name,
      ownerId: documentData.ownerId || null,
      createdBy: documentData.createdBy || (documentData.author || user.name),
      updatedBy: documentData.updatedBy || (documentData.author || user.name)
    };
    if (this.documents.has(data.designation)) {
      throw new Error(`A DOSSIER with designation '${data.designation}' already exists.`);
    }
    const document = new DossierDocument(data);
    this.documents.set(document.designation, document);
    return document;
  }

  getDocument(designation) {
    const document = this.documents.get(designation);
    if (!document) {
      throw new Error(`DOSSIER document '${designation}' not found.`);
    }
    return document;
  }

  listDocuments() {
    return Array.from(this.documents.values());
  }

  approveDocument(user, designation) {
    const document = this.getDocument(designation);
    document.approve(user);
    return document;
  }

  editDocument(user, designation, updates) {
    const document = this.getDocument(designation);
    document.edit(user, updates);
    return document;
  }

  addTestLog(user, designation, logData) {
    const document = this.getDocument(designation);
    return document.addTestLog(user, logData);
  }

  addIncidentReport(user, designation, reportData) {
    const document = this.getDocument(designation);
    return document.addIncidentReport(user, reportData);
  }

  updateTestLog(user, designation, testId, updates) {
    const document = this.getDocument(designation);
    return document.updateTestLog(user, testId, updates);
  }

  deleteTestLog(user, designation, testId) {
    const document = this.getDocument(designation);
    return document.deleteTestLog(user, testId);
  }

  updateIncidentReport(user, designation, reportId, updates) {
    const document = this.getDocument(designation);
    return document.updateIncidentReport(user, reportId, updates);
  }

  deleteIncidentReport(user, designation, reportId) {
    const document = this.getDocument(designation);
    return document.deleteIncidentReport(user, reportId);
  }

  toJSON() {
    return {
      entries: this.listDocuments().map((document) => document.toJSON())
    };
  }

  static fromJSON(json) {
    const entries = Array.isArray(json?.entries) ? json.entries : [];
    return new DossierRepository(entries);
  }

  static async loadFromJSONFile(filePath) {
    if (typeof require === "undefined") {
      throw new Error("File access is only supported in Node.js.");
    }
    const fs = require("fs");
    const raw = fs.readFileSync(filePath, "utf-8");
    return DossierRepository.fromJSON(JSON.parse(raw));
  }

  saveToJSONFile(filePath) {
    if (typeof require === "undefined") {
      throw new Error("File access is only supported in Node.js.");
    }
    const fs = require("fs");
    fs.writeFileSync(filePath, JSON.stringify(this.toJSON(), null, 2), "utf-8");
  }

  saveToLocalStorage(key = 'dossiers_storage') {
    if (typeof localStorage === 'undefined') {
      throw new Error('Local storage is not available.');
    }
    localStorage.setItem(key, JSON.stringify(this.toJSON()));
  }

  async saveToSupabase() {
    if (typeof _supabase === 'undefined') {
      throw new Error('Supabase is not initialized.');
    }
    const rows = this.listDocuments().map((document) => ({
      designation: document.designation,
      object_class: document.objectClass,
      clearance_level: document.clearanceLevel,
      author: document.author,
      owner_id: document.ownerId,
      created_by: document.createdBy,
      updated_by: document.updatedBy,
      description: document.description,
      containment_procedures: document.containmentProcedures,
      recontainment_procedures: document.recontainmentProcedures,
      status: document.status,
      test_logs: document.testLogs.map((log) => ({
        testId: log.testId,
        personnel: log.personnel,
        procedure: log.procedure,
        result: log.result,
        createdAt: log.createdAt
      })),
      incident_reports: document.incidentReports.map((report) => ({
        reportId: report.reportId,
        date: report.date,
        units: report.units,
        cause: report.cause,
        resolution: report.resolution,
        preventionNotes: report.preventionNotes,
        createdAt: report.createdAt
      })),
      created_at: document.createdAt,
      updated_at: document.updatedAt
    }));

    const { error } = await _supabase.from('dossiers').upsert(rows, { onConflict: 'designation', returning: 'minimal' });
    if (error) {
      throw error;
    }
    return true;
  }

  static async loadFromSupabase() {
    if (typeof _supabase === 'undefined') {
      throw new Error('Supabase is not initialized.');
    }
    const { data, error } = await _supabase.from('dossiers').select('*');
    if (error) {
      throw error;
    }
    return DossierRepository.fromSupabaseRows(data || []);
  }

  static fromSupabaseRows(rows) {
    const entries = (rows || []).map((row) => ({
      designation: row.designation,
      objectClass: row.object_class || row.objectClass,
      clearanceLevel: row.clearance_level || row.clearanceLevel,
      author: row.author,
      ownerId: row.owner_id || row.ownerId || null,
      createdBy: row.created_by || row.createdBy || null,
      updatedBy: row.updated_by || row.updatedBy || null,
      description: row.description,
      containmentProcedures: row.containment_procedures || row.containmentProcedures,
      recontainmentProcedures: row.recontainment_procedures || row.recontainmentProcedures,
      status: row.status,
      testLogs: row.test_logs || row.testLogs || [],
      incidentReports: row.incident_reports || row.incidentReports || [],
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt
    }));
    return new DossierRepository(entries);
  }

  static loadFromLocalStorage(key = 'dossiers_storage') {
    if (typeof localStorage === 'undefined') {
      throw new Error('Local storage is not available.');
    }
    const raw = localStorage.getItem(key);
    if (!raw) return new DossierRepository();
    try {
      return DossierRepository.fromJSON(JSON.parse(raw));
    } catch (error) {
      console.warn('Failed to load DOSSIERS repository from local storage:', error);
      return new DossierRepository();
    }
  }
}

function formatDossierHead(document) {
  return `${document.designation} | ${document.objectClass} | CL${document.clearanceLevel} | ${document.status}`;
}

function displayDossierSummary(document) {
  const summary = document.summary();
  return `DOSSIER ${summary.designation}
Object Class: ${summary.objectClass}
Clearance Level: CL${summary.clearanceLevel}
Status: ${summary.status}
Official: ${summary.official}
Author: ${summary.author}
Description: ${summary.description}
Containment Procedures: ${summary.containmentProcedures}
Recontainment Procedures: ${summary.recontainmentProcedures}
Test Logs: ${summary.testLogCount}
Incident Reports: ${summary.incidentReportCount}
Last Updated: ${summary.lastUpdated}`;
}

function createExampleRepository() {
  const repository = new DossierRepository();

  repository.createDocument(
    new ScDUser({ name: "Dr. Aurora Vale", clearanceLevel: 5 }),
    {
      designation: "DOSSIER-001",
      objectClass: "Euclid",
      clearanceLevel: 4,
      description: "A living archive that rewrites memory when contained.",
      containmentProcedures: "Store inside a hermetically sealed, Class-3 archive chamber. Only CL4+ personnel may access.",
      recontainmentProcedures: "If the archive breaches, isolate the wing, deploy MTF Rho-7, and restore memory nodes using Procedure 7-A.",
      testLogs: [
        {
          testId: "test-001",
          personnel: ["Dr. Vale", "Agent Kael"],
          procedure: "Subject was presented with recovered entries for verification.",
          result: "Object recorded a 30% anomaly increase, but containment remained stable."
        }
      ],
      incidentReports: [
        {
          reportId: "incident-001",
          date: "2026-04-05",
          units: ["MTF Epsilon-11", "ScD"],
          cause: "Unauthorized low-clearance access attempt.",
          resolution: "Access revoked and door lock firmware replaced.",
          preventionNotes: "Enforce CL4+ biometric verification and audit all entry logs."
        }
      ]
    }
  );

  return repository;
}

const DOSSIERS = {
  DEPARTMENT_SCD,
  DOSSIER_STATUSES,
  OBJECT_CLASSES,
  PermissionError,
  ScDUser,
  TestLogEntry,
  IncidentReport,
  DossierDocument,
  DossierRepository,
  formatDossierHead,
  displayDossierSummary,
  createExampleRepository
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = DOSSIERS;
}

if (typeof window !== "undefined") {
  window.DOSSIERS = DOSSIERS;
}
