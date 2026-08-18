/**
 * H2O — Institutional Reasoning Assessment
 * IRA-ASSESSMENT-WEB-001 / GitHub-side intake bridge v0.2
 *
 * Boundary:
 *   Browser -> HTTPS POST -> Google Apps Script Intake Receiver
 *   Google Apps Script -> Drive JSON artifact + Intake Ledger
 *
 * This module performs transport/validation only.
 * It does NOT score, diagnose, rate, or invoke IROS.
 */

const IRA_INTAKE_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbwCjooWUrmjUq2MGYopgnn-972oDmRNQ1cjfqBpdaWN1mxhBtkJivs2ibnv1_-aNjpI/exec';

const IRA_INTAKE_VERSION = 'IRA_SUBMISSION_V0.1';

function value(form, name) {
    const field = form?.elements?.namedItem(name);
    return field ? String(field.value ?? '').trim() : '';
}

/**
 * Build the canonical receiver payload from assessment.html.
 *
 * Important boundary decisions:
 * - Assessment level remains PRELIMINARY at intake.
 * - Interest in deeper work is captured separately.
 * - CONDITIONAL evidence willingness is preserved as CONDITIONAL.
 * - All preliminary probe responses are retained under `responses`.
 */
export function buildIRAPayload(form) {
    return {
        schema_version: '0.1',
        institution: value(form, 'institution'),
        contact_name: value(form, 'contact_name'),
        contact_email: value(form, 'contact_email'),

        // The public instrument is a preliminary assessment.
        // A deeper engagement is expressed through the separate interest field.
        assessment_level: 'Preliminary',

        evidence_willing: value(form, 'evidence_willing'),

        consequential_decision: value(form, 'probe_consequential_decision'),
        deeper_assessment_interest: value(form, 'probe_deeper_interest'),

        responses: collectAssessmentResponses(form),
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

export function validateIRAPayload(payload) {
    const required = [
        'institution',
        'contact_name',
        'contact_email',
        'assessment_level',
        'evidence_willing'
    ];

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

    if (payload.assessment_level !== 'Preliminary') {
        return { valid: false, message: 'Assessment intake must remain Preliminary.' };
    }

    if (!['YES', 'NO', 'CONDITIONAL'].includes(payload.evidence_willing)) {
        return { valid: false, message: 'Please specify whether supporting evidence could be provided.' };
    }

    return { valid: true, message: 'OK' };
}

export async function submitIRAAssessment(payload) {
    const validation = validateIRAPayload(payload);
    if (!validation.valid) throw new Error(validation.message);

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

export const IRA_INTAKE_STATES = Object.freeze({
    NEW: 'NEW',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED'
});
