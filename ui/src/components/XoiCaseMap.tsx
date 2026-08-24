import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type XoiCaseMapItemState = "available" | "blocked" | "satisfied" | "watching" | "reached" | "inactive";

export interface XoiCaseMapItem {
  id: string;
  kind: "requirement" | "evidence" | "event" | "blocker" | "milestone" | "discretionary" | "case_file" | "assignment";
  label: string;
  state?: XoiCaseMapItemState;
  summary?: string | null;
  refs?: string[];
}

export interface XoiCaseMapValue {
  caseId?: string;
  caseState?: string;
  caseFile?: XoiCaseMapItem[];
  context?: XoiCaseMapItem[];
  discretionaryWork?: XoiCaseMapItem[];
  assignedAgentTeamRef?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeState(value: unknown): XoiCaseMapItemState {
  return value === "available"
    || value === "blocked"
    || value === "satisfied"
    || value === "watching"
    || value === "reached"
    || value === "inactive"
    ? value
    : "available";
}

function normalizeKind(value: unknown): XoiCaseMapItem["kind"] {
  return value === "requirement"
    || value === "evidence"
    || value === "event"
    || value === "blocker"
    || value === "milestone"
    || value === "discretionary"
    || value === "case_file"
    || value === "assignment"
    ? value
    : "case_file";
}

function normalizeItems(value: unknown): XoiCaseMapItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const label = asString(item.label) ?? asString(item.name);
    if (!label) return [];
    const refs = Array.isArray(item.refs)
      ? item.refs.filter((ref): ref is string => typeof ref === "string")
      : undefined;
    return [{
      id: asString(item.id) ?? `item-${index + 1}`,
      kind: normalizeKind(item.kind),
      label,
      state: normalizeState(item.state),
      summary: asString(item.summary) ?? null,
      refs,
    }];
  });
}

export function normalizeXoiCaseMap(value: unknown): XoiCaseMapValue | null {
  if (!isRecord(value)) return null;
  return {
    caseId: asString(value.caseId),
    caseState: asString(value.caseState),
    caseFile: normalizeItems(value.caseFile),
    context: normalizeItems(value.context),
    discretionaryWork: normalizeItems(value.discretionaryWork),
    assignedAgentTeamRef: asString(value.assignedAgentTeamRef) ?? null,
  };
}

function stateVariant(state: XoiCaseMapItemState | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (state === "blocked") return "destructive";
  if (state === "reached" || state === "satisfied") return "default";
  if (state === "watching" || state === "inactive") return "outline";
  return "secondary";
}

function CaseMapItem({ item, selected, onSelect }: { item: XoiCaseMapItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40",
        selected && "ring-2 ring-ring",
        item.kind === "discretionary" && "border-dashed",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.kind.replaceAll("_", " ")}</p>
        </div>
        <Badge variant={stateVariant(item.state)}>{item.state ?? "available"}</Badge>
      </div>
      {item.summary ? <p className="mt-2 text-xs text-muted-foreground">{item.summary}</p> : null}
    </button>
  );
}

export function XoiCaseMap({ value }: { value: unknown }) {
  const model = useMemo(() => normalizeXoiCaseMap(value), [value]);
  const allItems = useMemo(
    () => model ? [...(model.caseFile ?? []), ...(model.context ?? []), ...(model.discretionaryWork ?? [])] : [],
    [model],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = allItems.find((item) => item.id === selectedId) ?? null;

  if (!model) {
    return <p className="text-sm text-muted-foreground">Invalid XOI case-map value.</p>;
  }

  return (
    <div className="space-y-3" data-xoi-case-map="true">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Case management map</p>
          <p className="text-xs text-muted-foreground">Contextual case state, not process sequence.</p>
        </div>
        <div className="flex items-center gap-2">
          {model.caseId ? <Badge variant="outline" className="font-mono">{model.caseId}</Badge> : null}
          {model.caseState ? <Badge variant="secondary">{model.caseState}</Badge> : null}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="gap-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Case file</p>
            <p className="mt-1 text-xs text-muted-foreground">Requirements, evidence, events, blockers, milestones, and case references.</p>
          </div>
          <div className="space-y-2">
            {(model.caseFile ?? []).length > 0
              ? model.caseFile!.map((item) => (
                  <CaseMapItem key={item.id} item={item} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} />
                ))
              : <p className="text-xs text-muted-foreground">No case-file items.</p>}
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground">Prepared agent/team assignment</p>
            <p className="mt-1 font-mono text-xs">
              {model.assignedAgentTeamRef ?? "Unassigned"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Roles, tools, skills, capabilities, permissions, and resources stay in Agent/Team Design; the case stores only the assignment reference.
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="gap-3 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contextual plan</p>
              <p className="mt-1 text-xs text-muted-foreground">Items become applicable from case state and sentry conditions; no implied A→B order.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(model.context ?? []).length > 0
                ? model.context!.map((item) => (
                    <CaseMapItem key={item.id} item={item} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} />
                  ))
                : <p className="text-xs text-muted-foreground">No contextual items.</p>}
            </div>
          </Card>

          <Card className="gap-3 border-dashed p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Planning table</p>
              <p className="mt-1 text-xs text-muted-foreground">Discretionary work available because of current context.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(model.discretionaryWork ?? []).length > 0
                ? model.discretionaryWork!.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={selectedId === item.id ? "secondary" : "outline"}
                      className="border-dashed"
                      onClick={() => setSelectedId(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))
                : <p className="text-xs text-muted-foreground">No discretionary work available.</p>}
            </div>
          </Card>
        </div>
      </div>

      {selected ? (
        <Card className="gap-2 p-4" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
            <Badge variant={stateVariant(selected.state)}>{selected.state ?? "available"}</Badge>
          </div>
          <p className="text-sm font-medium">{selected.label}</p>
          {selected.summary ? <p className="text-xs text-muted-foreground">{selected.summary}</p> : null}
          {selected.refs?.length ? (
            <div className="flex flex-wrap gap-1">
              {selected.refs.map((ref) => <Badge key={ref} variant="outline" className="font-mono">{ref}</Badge>)}
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
