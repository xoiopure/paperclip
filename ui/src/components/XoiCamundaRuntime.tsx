import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface XoiCamundaBpmnRef {
  processDefinitionId?: string | null;
  processDefinitionKey?: string | null;
  processInstanceKey?: string | null;
  elementId?: string | null;
  elementInstanceKey?: string | null;
  state?: string | null;
}

export interface XoiCamundaDmnRef {
  decisionDefinitionId?: string | null;
  decisionDefinitionKey?: string | null;
  decisionEvaluationKey?: string | null;
  state?: string | null;
}

export interface XoiCamundaRuntimeValue {
  clusterRef?: string | null;
  bpmn?: XoiCamundaBpmnRef | null;
  dmn?: XoiCamundaDmnRef | null;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function Readout({ label, value }: { label: string; value: string | null | undefined }) {
  if (!hasText(value)) return null;
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all font-mono">{value}</span>
    </div>
  );
}

export function XoiCamundaRuntime({ value }: { value: XoiCamundaRuntimeValue }) {
  const hasBpmn = Boolean(value.bpmn && Object.values(value.bpmn).some(hasText));
  const hasDmn = Boolean(value.dmn && Object.values(value.dmn).some(hasText));

  return (
    <div className="space-y-3" data-xoi-camunda-runtime="true">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Camunda runtime</p>
          <p className="text-xs text-muted-foreground">
            BPMN execution and DMN evaluation references. CMMN remains a separate XOI case-model concern.
          </p>
        </div>
        {hasText(value.clusterRef) ? <Badge variant="outline" className="font-mono">{value.clusterRef}</Badge> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">BPMN</p>
            <Badge variant={hasBpmn ? "secondary" : "outline"}>{hasBpmn ? "linked" : "unlinked"}</Badge>
          </div>
          {hasBpmn ? (
            <div className="space-y-2">
              <Readout label="Definition ID" value={value.bpmn?.processDefinitionId} />
              <Readout label="Definition key" value={value.bpmn?.processDefinitionKey} />
              <Readout label="Instance key" value={value.bpmn?.processInstanceKey} />
              <Readout label="Element ID" value={value.bpmn?.elementId} />
              <Readout label="Element instance" value={value.bpmn?.elementInstanceKey} />
              <Readout label="State" value={value.bpmn?.state} />
            </div>
          ) : <p className="text-xs text-muted-foreground">No BPMN runtime reference.</p>}
        </Card>

        <Card className="gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">DMN</p>
            <Badge variant={hasDmn ? "secondary" : "outline"}>{hasDmn ? "linked" : "unlinked"}</Badge>
          </div>
          {hasDmn ? (
            <div className="space-y-2">
              <Readout label="Decision ID" value={value.dmn?.decisionDefinitionId} />
              <Readout label="Decision key" value={value.dmn?.decisionDefinitionKey} />
              <Readout label="Evaluation key" value={value.dmn?.decisionEvaluationKey} />
              <Readout label="State" value={value.dmn?.state} />
            </div>
          ) : <p className="text-xs text-muted-foreground">No DMN runtime reference.</p>}
        </Card>
      </div>
    </div>
  );
}
