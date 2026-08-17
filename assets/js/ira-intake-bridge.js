/**
 * H2O — Institutional Reasoning Assessment
 * IRA-ASSESSMENT-WEB-001 / GitHub-side intake bridge v0.1
 *
 * STAGING RULE:
 * This module is intentionally NOT imported by index.html or assessment.html yet.
 * It provides the production submission boundary for the future assessment page.
 *
 * Boundary:
 *   Browser -> HTTPS POST -> Google Apps Script Intake Receiver
 *   Google Apps Script -> Drive JSON artifact + Intake Ledger
 *
 * This file performs NO diagnostic reasoning, scoring, or capability rating.
 */

const IRA_INTAKE_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbwCjooWUrmjUq2MGYopgnn-972oDmRNQ1cjfqBpdaWN1mxhBtkJivs2ibnv1_-aNjpI/exec';

const IRA_INTAKE_VERSION = 'IRA_SUBMISSION_V0.1';

/**
 * Build the transport payload from a form-like object.
 * The field names are deliberately aligned with the intake ledger and
 * preliminary assessment architecture.
 */
export function buildIRAPayload(form) {
    const value = (name) => {
        const field = form?.elements?.namedItem(name);
        return field ? String(field.value ?? '').trim() : '';
    };

    return {
        schema_version: IRA_INTAKE_VERSION,
        client_timestamp: new Date().toISOString(),

        institution: value('institution'),
        contact_name: value('contact_name'),
        contact_email: value('contact_email'),

        assessment_level: value('assessment_level') || 'Preliminary',
        evidence_willing: value('evidence_willing'),

        // Preliminary assessment responses only.
        // No diagnostic score is generated or transmitted here.
        responses: collectAssessmentResponses(form),

        // Artifact handling remains a separate controlled stage.
        artifact_status: 'NONE'
    };
}

function collectAssessmentResponses(form) {
    const responses = {};
    if (!form?.elements) return responses;

    for (const field of Array.from(form.elements)) {
        if (!field.name || !field.name.startsWith('probe_')) continue;

        if (field.type === 'checkbox') {
            responses[field.name] = field.checked;
        } else if (field.type === 'radio') {
            if (field.checked) responses[field.name] = field.value;
        } else {
            responses[field.name] = String(field.value ?? '').trim();
        }
    }

    return responses;
}

/**
 * Lightweight browser-side validation.
 * The receiver remains authoritative for transport/schema validation.
 */
export function validateIRAPayload(payload) {
    const required = ['institution', 'contact_name', 'contact_email'];
    const missing = required.filter((key) => !payload?.[key]);

    if (missing.length) {
        return {
            valid: false,
            message: `Required information missing: ${missing.join(', ')}`
        };
    }

    const email = String(payload.contact_email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valid: false, message: 'Please provide a valid contact email address.' };
    }

    return { valid: true, message: 'OK' };
}

/**
 * Submit a validated payload to the Google Workspace intake receiver.
 * Content-Type text/plain avoids an unnecessary CORS preflight with Apps Script.
 */
export async function submitIRAAssessment(payload) {
    const validation = validateIRAPayload(payload);
    if (!validation.valid) {
        throw new Error(validation.message);
    }

    const response = await fetch(IRA_INTAKE_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`IRA intake receiver returned HTTP ${response.status}.`);
    }

    const result = await response.json();

    if (result?.status !== 'SUCCESS') {
        throw new Error(result?.message || 'IRA intake receiver rejected the submission.');
    }

    return result;
}

/**
 * Safe operational state labels for the client UI.
 * These mirror the Drive intake lifecycle without exposing internal analysis.
 */
export const IRA_INTAKE_STATES = Object.freeze({
    NEW: 'NEW',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED'
});
