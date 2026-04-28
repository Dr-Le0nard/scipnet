// scpData.js — hardcoded SCP dossier entries (read-only)
//
// CRITICAL: Users must not be able to create/edit SCP entries from the UI.
// This file is the source of truth for SCP dossier content.

const SCP_DOSSIERS = [
    {
        id: "SCP-001",
        objectClass: "Euclid",
        clearanceLevel: "CL4+",
        status: "Approved",
        description: "A living archive that rewrites memory when contained.",
        containmentProcedures: "Store inside a hermetically sealed, Class-3 archive chamber. Only CL4+ personnel may access.",
        recontainmentProcedures: "If the archive breaches, isolate the wing, deploy MTF Rho-7, and restore memory nodes using Procedure 7-A.",
        testingGuidelines: "All testing requires prior approval by ScD command. Maintain continuous surveillance and log all exposure windows."
    },
    {
        id: "SCP-096",
        objectClass: "Euclid",
        clearanceLevel: "CL3+",
        status: "Approved",
        description: "REDACTED — Populate with approved dossier content.",
        containmentProcedures: "REDACTED — Populate with approved dossier content.",
        recontainmentProcedures: "REDACTED — Populate with approved dossier content.",
        testingGuidelines: "REDACTED — Populate with approved dossier content."
    }
];

if (typeof window !== "undefined") {
    window.SCP_DOSSIERS = SCP_DOSSIERS;
}

