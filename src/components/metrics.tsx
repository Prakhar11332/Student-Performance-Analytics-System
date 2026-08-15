import { cn } from "@/lib/utils";
import { attendanceTone, gradeFor, marksTone, type Tone } from "@/lib/academic-data";
import { Badge } from "@/components/ui/badge";

const toneChip: Record<Tone, string> = {
  good: "bg-status-good-soft text-status-good",
  warn: "bg-status-warn-soft text-status-warn",
  bad: "bg-status-bad-soft text-status-bad",
};

const toneDot: Record<Tone, string> = {
  good: "bg-status-good",
  warn: "bg-status-warn",
  bad: "bg-status-bad",
};

export function ToneDot({ tone, className }: { tone: Tone; className?: string }) {
  return <span className={cn("inline-block size-2.5 shrink-0 rounded-full", toneDot[tone], className)} />;
}

export function MarksPill({ marks, className }: { marks: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneChip[marksTone(marks)],
        className,
      )}
    >
      {marks}%
      <span className="font-normal opacity-80">grade {gradeFor(marks)}</span>
    </span>
  );
}

export function AttendancePill({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneChip[attendanceTone(value)],
        className,
      )}
    >
      {value}% present
    </span>
  );
}

export function MetricLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground", className)}>
      <span className="font-medium text-foreground">Marks &amp; attendance</span>
      <span className="inline-flex items-center gap-2">
        <ToneDot tone="good" /> Good <span className="opacity-70">marks ≥70, attendance ≥85%</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <ToneDot tone="warn" /> Watch <span className="opacity-70">marks 50–69, attendance 75–84%</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <ToneDot tone="bad" /> Low <span className="opacity-70">marks &lt;50, attendance &lt;75%</span>
      </span>
    </div>
  );
}

export function StatusBadge({ status, className }: { status: "passed" | "backlog" | "pending"; className?: string }) {
  if (status === "passed") {
    return <Badge className={cn("bg-status-good hover:bg-status-good/90", className)}>Passed</Badge>;
  }
  if (status === "backlog") {
    return <Badge variant="destructive" className={className}>Backlog</Badge>;
  }
  return <Badge variant="secondary" className={className}>Pending</Badge>;
}
