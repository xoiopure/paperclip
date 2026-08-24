import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface XoiCmmnModelValue {
  definitionId?: string | null;
  modelRef?: string | null;
  documentKey?: string | null;
  namespace?: string | null;
  moddle?: {
    base?: string | null;
    extension?: string | null;
    version?: string | null;
  } | null;
  state?: string | null;
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!text(value)) return null;
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all font-mono">{value}</span>
    </div>
  );
}

export function XoiCmmnModel({ value }: { value: XoiCmmnModelValue }) {
  return (
    <Card className="gap-3 p-4" data-xoi-cmmn-model="true">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">CMMN model</p>
          <p className="text-xs text-muted-foreground">
            Standards-native CMMN 1.1 model reference. XML remains the canonical model artifact.
          </p>
        </div>
        <Badge variant="outline">{text(value.state) ? value.state : "model"}</Badge>
      </div>

      <div className="space-y-2">
        <Row label="Definition ID" value={value.definitionId} />
        <Row label="Model ref" value={value.modelRef} />
        <Row label="Case document" value={value.documentKey} />
        <Row label="Namespace" value={value.namespace} />
        <Row label="Base moddle" value={value.moddle?.base} />
        <Row label="Camunda extension" value={value.moddle?.extension} />
        <Row label="Extension version" value={value.moddle?.version} />
      </div>

      <p className="text-xs text-muted-foreground">
        Expected parser stack: cmmn-moddle + camunda-cmmn-moddle. The Camunda extension descriptor adds CMMN 1.1 properties such as assignee/candidate bindings, process and decision bindings, listeners, forms, and variable mappings.
      </p>
    </Card>
  );
}
