# XOI × Paperclip × Camunda integration

## Goal

Reuse existing mechanics instead of inventing a parallel workflow system.

- **Paperclip** remains the persistent control plane: cases, documents/revisions, attachments, linked tasks, activity events, agents/teams, approvals, budgets, heartbeats, runtime skills, and audit history.
- **Camunda** supplies standards-native **BPMN process execution** and **DMN decision execution/model semantics**.
- **XOI CMMN case modeling** remains a separate case-context layer. The inspected `xoiopure/camunda` codebase does not expose CMMN implementation surfaces, so this integration does not pretend otherwise.
- **Agent/Team Design** remains separate from case state. A case records only the prepared agent/team assignment reference and case requirements; roles, skills, tools, capabilities, permissions, and resources stay with the prepared unit.

## Existing Paperclip substrate reused

Paperclip already provides the required persistence skeleton:

- `Cases` and `CaseDetail`
- arbitrary structured case `fields`
- case documents and revision history
- attachments
- parent/child case relationships
- linked tasks
- activity/event history with actor/run attribution
- org chart and agent runtime
- approval/governance and budget controls

No duplicate XOI case backend is introduced in the first slice.

## XOI case contract

The `xoiCaseMap` case field is reserved for contextual case-state projection:

```json
{
  "caseId": "XOI-BUILD-001",
  "caseState": "active",
  "assignedAgentTeamRef": "TEAM-XOI-CASE-001",
  "caseFile": [
    {
      "id": "req-001",
      "kind": "requirement",
      "label": "Standards-native process execution",
      "state": "available",
      "refs": ["evidence-001"]
    }
  ],
  "context": [
    {
      "id": "ms-001",
      "kind": "milestone",
      "label": "BUILD_READY",
      "state": "inactive"
    }
  ],
  "discretionaryWork": [
    {
      "id": "disc-001",
      "kind": "discretionary",
      "label": "Inspect evidence",
      "state": "available"
    }
  ]
}
```

The case map contains case context only. It must not absorb the agent/team design schema.

## Camunda runtime-reference contract

The `xoiCamundaRuntime` case field links the Paperclip case to Camunda runtime/model identities without copying Camunda's execution engine into Paperclip:

```json
{
  "clusterRef": "camunda-primary",
  "bpmn": {
    "processDefinitionId": "...",
    "processDefinitionKey": "...",
    "processInstanceKey": "...",
    "elementId": "...",
    "elementInstanceKey": "...",
    "state": "ACTIVE"
  },
  "dmn": {
    "decisionDefinitionId": "...",
    "decisionDefinitionKey": "...",
    "decisionEvaluationKey": "...",
    "state": "EVALUATED"
  }
}
```

## Runtime relationship

```text
Paperclip Case
  ├─ case state / evidence / documents / events / history
  ├─ assignedAgentTeamRef ──────────────► Agent / Team Design
  ├─ xoiCaseMap ────────────────────────► XOI CMMN case projection
  └─ xoiCamundaRuntime
       ├─ BPMN runtime refs ─────────────► Camunda
       └─ DMN runtime refs ──────────────► Camunda
```

BPMN controls process flow. DMN controls decisions. CMMN controls evolving case context. Paperclip persists the operational control-plane record and agent/team execution context.

## Reusable fragments

Reusable work should be stored by native type rather than flattened into prose:

- BPMN process/subprocess/model references
- DMN decisions, DRDs, decision tables, and FEEL expressions
- XOI CMMN case-map fragments and case-file schemas
- prepared agent/team designs
- Paperclip case templates
- evidence/validation patterns

## First implementation slice

Added:

- `ui/src/components/XoiCaseMap.tsx`
- `ui/src/components/XoiCaseMap.test.tsx`
- `ui/src/components/XoiCamundaRuntime.tsx`

Next integration seam is rendering reserved `xoiCaseMap` and `xoiCamundaRuntime` fields through these dedicated components in `CaseDetail` / `CaseFieldValue`, then wiring Camunda API synchronization behind the reference contract.
