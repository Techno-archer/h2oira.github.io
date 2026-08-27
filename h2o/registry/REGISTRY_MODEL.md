# H2O Registry Model

The operating control plane maintains five primary registries:

1. Architecture Register — what H2O is required to contain and whether each component is implemented/verified.
2. Capability Register — whether a function is executable and whether prompt, procedure, calculation, validation, output and handoff exist.
3. Notebook Registry — Notebook prompt/response/procedure/calculation/validation/production readiness.
4. Evidence Registry — source classification, provenance, transformation and downstream use.
5. Artifact Registry — production output, version, status and repository location.

A sixth continuity object is maintained through Session Handoffs / JSON fast state.
