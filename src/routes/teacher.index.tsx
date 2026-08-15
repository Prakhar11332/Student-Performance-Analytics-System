import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { RowSkeleton, useLoaded } from "@/components/loading";
import { AttendancePill, MarksPill, MetricLegend } from "@/components/metrics";
import { EmptyState, PageHeader } from "@/components/portal-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { average, useAcademic, type StudentRecord } from "@/lib/academic-data";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Student roster — Retentia Faculty" },
      {
        name: "description",
        content: "Simple roster of every student with marks and attendance per course, with add, edit and delete.",
      },
      { property: "og:title", content: "Student roster — Retentia Faculty" },
      { property: "og:description", content: "Marks and attendance roster with full record management." },
    ],
  }),
  component: RosterPage,
});

type Draft = {
  name: string;
  rollNo: string;
  email: string;
  program: string;
  year: string;
  marks: Record<string, string>;
  attendance: Record<string, string>;
};

const emptyDraft = (): Draft => ({
  name: "",
  rollNo: "",
  email: "",
  program: "B.Tech Computer Science",
  year: "Third year",
  marks: {},
  attendance: {},
});

function draftFrom(student: StudentRecord): Draft {
  const marks: Record<string, string> = {};
  const attendance: Record<string, string> = {};
  student.enrollments.forEach((e) => {
    marks[e.courseId] = String(e.marks);
    attendance[e.courseId] = String(e.attendance);
  });
  return {
    name: student.name,
    rollNo: student.rollNo,
    email: student.email,
    program: student.program,
    year: student.year,
    marks,
    attendance,
  };
}

const clamp = (raw: string) => Math.max(0, Math.min(100, Math.round(Number(raw) || 0)));

function RosterPage() {
  const loaded = useLoaded();
  const { students, courses, addStudent, updateStudent, deleteStudent } = useAcademic();

  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [editing, setEditing] = useState<StudentRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  const rows = useMemo(
    () =>
      students.filter((s) => {
        const matchesQuery =
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.rollNo.toLowerCase().includes(q.toLowerCase());
        const matchesCourse =
          courseFilter === "all" || s.enrollments.some((e) => e.courseId === courseFilter);
        return matchesQuery && matchesCourse;
      }),
    [students, q, courseFilter],
  );

  const visibleCourses = courseFilter === "all" ? courses : courses.filter((c) => c.id === courseFilter);

  const classMarks = average(
    rows.flatMap((s) =>
      s.enrollments
        .filter((e) => courseFilter === "all" || e.courseId === courseFilter)
        .map((e) => e.marks),
    ),
  );
  const classAttendance = average(
    rows.flatMap((s) =>
      s.enrollments
        .filter((e) => courseFilter === "all" || e.courseId === courseFilter)
        .map((e) => e.attendance),
    ),
  );

  function openAdd() {
    setEditing(null);
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(student: StudentRecord) {
    setEditing(student);
    setDraft(draftFrom(student));
    setOpen(true);
  }

  function save() {
    if (!draft.name.trim() || !draft.rollNo.trim()) {
      toast.error("Name and roll number are required");
      return;
    }
    const enrollments = courses
      .filter((c) => draft.marks[c.id] !== undefined || draft.attendance[c.id] !== undefined)
      .map((c) => ({
        courseId: c.id,
        marks: clamp(draft.marks[c.id] ?? "0"),
        attendance: clamp(draft.attendance[c.id] ?? "0"),
      }));

    const payload = {
      name: draft.name.trim(),
      rollNo: draft.rollNo.trim(),
      email: draft.email.trim() || `${draft.rollNo.trim().toLowerCase()}@student.univ.edu`,
      program: draft.program,
      year: draft.year,
      enrollments,
    };

    if (editing) {
      updateStudent(editing.id, payload);
      toast.success("Student updated", { description: `${payload.name} · ${payload.rollNo}` });
    } else {
      addStudent(payload);
      toast.success("Student added", { description: `${payload.name} · ${payload.rollNo}` });
    }
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Student roster"
        description="Marks and attendance per course. Add, edit or remove any student record."
        actions={
          <Button onClick={openAdd}>
            <Plus className="size-4" /> Add student
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Students listed", value: `${rows.length}` },
          { label: "Average marks", value: `${classMarks}%` },
          { label: "Average attendance", value: `${classAttendance}%` },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="pt-5">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</p>
              <p className="mt-1 font-display text-2xl">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or roll number"
            className="pl-9"
          />
        </div>
        <Button
          size="sm"
          variant={courseFilter === "all" ? "default" : "outline"}
          onClick={() => setCourseFilter("all")}
        >
          All courses
        </Button>
        {courses.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={courseFilter === c.id ? "default" : "outline"}
            onClick={() => setCourseFilter(c.id)}
          >
            {c.code}
          </Button>
        ))}
      </div>

      {!loaded ? (
        <RowSkeleton rows={8} />
      ) : rows.length === 0 ? (
        <EmptyState title="No students matched" description="Try a different name, roll number or course." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll no.</TableHead>
                {visibleCourses.map((c) => (
                  <TableHead key={c.id}>{c.code} marks / attendance</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.rollNo}</TableCell>
                  {visibleCourses.map((c) => {
                    const e = s.enrollments.find((en) => en.courseId === c.id);
                    return (
                      <TableCell key={c.id}>
                        {e ? (
                          <span className="flex flex-wrap items-center gap-2">
                            <MarksPill marks={e.marks} />
                            <AttendancePill value={e.attendance} />
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not enrolled</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete"
                        onClick={() => {
                          deleteStudent(s.id);
                          toast.success("Student removed", { description: s.name });
                        }}
                      >
                        <Trash2 className="size-4 text-status-bad" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MetricLegend className="mt-5" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="roll">Roll number</Label>
              <Input
                id="roll"
                value={draft.rollNo}
                onChange={(e) => setDraft({ ...draft, rollNo: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="program">Programme</Label>
              <Input
                id="program"
                value={draft.program}
                onChange={(e) => setDraft({ ...draft, program: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={draft.year}
                onChange={(e) => setDraft({ ...draft, year: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-2 space-y-3">
            <p className="text-sm font-medium">Marks &amp; attendance</p>
            {courses.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2">
                <span className="text-sm">
                  {c.code} <span className="text-muted-foreground">{c.name}</span>
                </span>
                <Input
                  aria-label={`${c.code} marks`}
                  placeholder="Marks"
                  value={draft.marks[c.id] ?? ""}
                  onChange={(e) => setDraft({ ...draft, marks: { ...draft.marks, [c.id]: e.target.value } })}
                />
                <Input
                  aria-label={`${c.code} attendance`}
                  placeholder="Att. %"
                  value={draft.attendance[c.id] ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, attendance: { ...draft.attendance, [c.id]: e.target.value } })
                  }
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Leave both fields empty to keep the student out of that course.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
