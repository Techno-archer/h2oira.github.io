# H2O Ingestion Portal Contract

## Purpose
Primary controlled entry point for material entering the H2O operating perimeter.

## Sequence
1. RECEIVE
2. IDENTIFY
3. CLASSIFY
4. PRESERVE
5. ROUTE
6. INTERROGATE
7. VALIDATE
8. REGISTER
9. HANDOFF
10. TERMINATE

## Ingestion object
`Source → Intake Record → Prompt/Procedure → Response → Aurora Assessment → Accepted Data/Logic → Downstream Output`

## Notebook rule
A Notebook prompt and response are methodology-source objects. They must be preserved separately from verified external evidence and separately from the production procedure eventually derived from them.

## Required audit fields
- source identity
- source type
- date / effective date
- provenance
- confidentiality classification
- prompt / procedure identity
- response
- transformations
- validation status
- unresolved issues
- downstream destination
- version
