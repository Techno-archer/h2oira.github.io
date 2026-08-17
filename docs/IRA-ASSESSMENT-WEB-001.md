# IRA-ASSESSMENT-WEB-001 — Intake Boundary

**Status:** GitHub-side bridge staged; page integration intentionally deferred.

## Production boundary

```text
CLIENT
  │
  │  Assessment page (GitHub Pages)
  ▼
IRA GitHub-side intake bridge
  │
  │  HTTPS POST / JSON
  ▼
Google Apps Script Intake Receiver
  │
  ├── 00_INTAKE / NEW / IRA_SUBMISSION_*.json
  ├── Intake Ledger / IRA_Assessment_Intake_Ledger
  └── controlled lifecycle to PROCESSING / COMPLETE / FAILED
```

## Google Workspace target

- Ledger: `IRA_Assessment_Intake_Ledger`
- `00_INTAKE/NEW`: `1whT4TzQs4FyNRs4AC0M_q-X0_Nm7C3zm`
- `01_ASSESSMENTS`: `16eRarTFjOmSJVPWvoUVfmWPR_8mQtenq`
- `02_REPORTS`: `18K9tJ7rdD-nhDZyTV1KAqhwNqge5wDg3`
- `03_SEND_FEEDBACK`: `12TVEpfMiOhxO869JL4b50YKn--I3_Ws2`

## Receiver

The deployed Google Apps Script Web App is:

`https://script.google.com/macros/s/AKfycbwCjooWUrmjUq2MGYopgnn-972oDmRNQ1cjfqBpdaWN1mxhBtkJivs2ibnv1_-aNjpI/exec`

Deployment: `IRA-ASSESSMENT-WEB-001 / Intake Receiver v0.1`

## Important architectural boundary

The GitHub/browser layer is a **collection and transport layer only**.

It must not:

- calculate an institutional score;
- issue a capability rating;
- perform IROS reasoning;
- create a substantive assessment finding;
- expose IROS to the client;
- treat preliminary self-report as an institutional conclusion.

The preliminary assessment is explicitly a **surface-level diagnostic entry point**. Deeper assessment levels and implementation options are determined only after the preliminary intake and, where appropriate, evidence review.

## Ledger invariant

No diagnostic scores or capability ratings belong in the intake ledger. The substantive assessment record belongs in `01_ASSESSMENTS`.

## Current staging rule

`assets/js/ira-intake-bridge.js` has been placed in the repository but is **not imported by `index.html`** and is not yet connected to the public assessment page.

This preserves the current live site while the assessment page and submission/confirmation UX are finalized.

## Next integration step

When H₂O confirms the assessment page UX, wire the page to the bridge with an explicit form submit handler. Do not modify the intake boundary or Google Workspace IDs during that step unless separately authorized.
