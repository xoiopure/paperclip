// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { normalizeXoiCaseMap } from "./XoiCaseMap";

describe("normalizeXoiCaseMap", () => {
  it("keeps agent/team design outside the case and stores only its assignment reference", () => {
    const model = normalizeXoiCaseMap({
      caseId: "XOI-BUILD-001",
      caseState: "active",
      caseFile: [
        { id: "req-1", kind: "requirement", label: "Need evidence validation", state: "available" },
      ],
      context: [
        { id: "milestone-1", kind: "milestone", label: "BUILD_READY", state: "inactive" },
      ],
      discretionaryWork: [
        { id: "disc-1", kind: "discretionary", label: "Inspect evidence", state: "available" },
      ],
      assignedAgentTeamRef: "TEAM-XOI-CASE-001",
      roles: ["Operator"],
      tools: ["BPMN Modeler"],
      skills: ["CMMN modeling"],
    });

    expect(model?.assignedAgentTeamRef).toBe("TEAM-XOI-CASE-001");
    expect(model?.caseFile?.[0]?.kind).toBe("requirement");
    expect(model).not.toHaveProperty("roles");
    expect(model).not.toHaveProperty("tools");
    expect(model).not.toHaveProperty("skills");
  });

  it("rejects non-object case-map data", () => {
    expect(normalizeXoiCaseMap(null)).toBeNull();
    expect(normalizeXoiCaseMap("not-a-map")).toBeNull();
  });
});
