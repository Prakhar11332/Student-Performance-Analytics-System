import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  useAcademic,
  type Course,
  type Teacher,
} from "@/lib/academic-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/teacher/settings")({
  head: () => ({
    meta: [
      { title: "Admin settings — Retentia" },
      { name: "description", content: "Manage teacher accounts and courses for the department." },
      { property: "og:title", content: "Admin settings — Retentia" },
      { property: "og:description", content: "Manage teachers and courses." },
    ],
  }),
  component: AdminSettings,
});

type TeacherDraft = { name: string; email: string; department: string; active: boolean };
type CourseDraft = { code: string; name: string; teacherId: string; credits: string };

function AdminSettings() {
  const { user } = useAuth();
  const {
    teachers,
    courses,
    students,
    teacherById,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addCourse,
    updateCourse,
    deleteCourse,
  } = useAcademic();

  const [teacherOpen, setTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherDraft, setTeacherDraft] = useState<TeacherDraft>({
    name: "",
    email: "",
    department: "Computer Science",
    active: true,
  });

  const [courseOpen, setCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseDraft, setCourseDraft] = useState<CourseDraft>({
    code: "",
    name: "",
    teacherId: "",
    credits: "3",
  });

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <ShieldAlert className="mx-auto size-8 text-status-warn" />
        <h1 className="mt-3 font-display text-xl">Admin only</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Teacher and course management is restricted to administrator accounts.
        </p>
      </div>
    );
  }

  function saveTeacher() {
    if (!teacherDraft.name.trim()) {
      toast.error("Teacher name is required");
      return;
    }
    const payload = {
      name: teacherDraft.name.trim(),
      email: teacherDraft.email.trim() || "unassigned@univ.edu",
      department: teacherDraft.department.trim(),
      active: teacherDraft.active,
    };
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, payload);
      toast.success("Teacher updated", { description: payload.name });
    } else {
      addTeacher(payload);
      toast.success("Teacher added", { description: payload.name });
    }
    setTeacherOpen(false);
  }

  function saveCourse() {
    if (!courseDraft.code.trim() || !courseDraft.name.trim()) {
      toast.error("Course code and name are required");
      return;
    }
    const payload = {
      code: courseDraft.code.trim(),
      name: courseDraft.name.trim(),
      teacherId: courseDraft.teacherId || (teachers[0]?.id ?? ""),
      credits: Math.max(1, Math.min(10, Math.round(Number(courseDraft.credits) || 3))),
    };
    if (editingCourse) {
      updateCourse(editingCourse.id, payload);
      toast.success("Course updated", { description: `${payload.code} · ${payload.name}` });
    } else {
      addCourse(payload);
      toast.success("Course added", { description: `${payload.code} · ${payload.name}` });
    }
    setCourseOpen(false);
  }

  return (
    <div>
      <PageHeader title="Admin settings" description="Manage teacher accounts and the course catalogue." />

      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Teachers</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingTeacher(null);
                setTeacherDraft({ name: "", email: "", department: "Computer Science", active: true });
                setTeacherOpen(true);
              }}
            >
              <Plus className="size-4" /> Add teacher
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-6 font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.email}</TableCell>
                    <TableCell>{t.department}</TableCell>
                    <TableCell>
                      {courses.filter((c) => c.teacherId === t.id).map((c) => c.code).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.active ? "default" : "secondary"}>
                        {t.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit teacher"
                          onClick={() => {
                            setEditingTeacher(t);
                            setTeacherDraft({
                              name: t.name,
                              email: t.email,
                              department: t.department,
                              active: t.active,
                            });
                            setTeacherOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete teacher"
                          onClick={() => {
                            deleteTeacher(t.id);
                            toast.success("Teacher removed", { description: t.name });
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
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Courses</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingCourse(null);
                setCourseDraft({ code: "", name: "", teacherId: teachers[0]?.id ?? "", credits: "3" });
                setCourseOpen(true);
              }}
            >
              <Plus className="size-4" /> Add course
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Code</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 font-medium">{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacherById(c.teacherId)?.name ?? "Unassigned"}
                    </TableCell>
                    <TableCell>{c.credits}</TableCell>
                    <TableCell>
                      {students.filter((s) => s.enrollments.some((e) => e.courseId === c.id)).length}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit course"
                          onClick={() => {
                            setEditingCourse(c);
                            setCourseDraft({
                              code: c.code,
                              name: c.name,
                              teacherId: c.teacherId,
                              credits: String(c.credits),
                            });
                            setCourseOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete course"
                          onClick={() => {
                            deleteCourse(c.id);
                            toast.success("Course removed", { description: `${c.code} · ${c.name}` });
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={teacherOpen} onOpenChange={setTeacherOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? "Edit teacher" : "Add teacher"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="t-name">Name</Label>
              <Input
                id="t-name"
                value={teacherDraft.name}
                onChange={(e) => setTeacherDraft({ ...teacherDraft, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="t-email">Email</Label>
              <Input
                id="t-email"
                type="email"
                value={teacherDraft.email}
                onChange={(e) => setTeacherDraft({ ...teacherDraft, email: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="t-dept">Department</Label>
              <Input
                id="t-dept"
                value={teacherDraft.department}
                onChange={(e) => setTeacherDraft({ ...teacherDraft, department: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={teacherDraft.active}
                onChange={(e) => setTeacherDraft({ ...teacherDraft, active: e.target.checked })}
              />
              Active account
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeacherOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTeacher}>{editingTeacher ? "Save changes" : "Add teacher"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit course" : "Add course"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="c-code">Course code</Label>
              <Input
                id="c-code"
                value={courseDraft.code}
                onChange={(e) => setCourseDraft({ ...courseDraft, code: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-name">Course name</Label>
              <Input
                id="c-name"
                value={courseDraft.name}
                onChange={(e) => setCourseDraft({ ...courseDraft, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-teacher">Teacher</Label>
              <select
                id="c-teacher"
                value={courseDraft.teacherId}
                onChange={(e) => setCourseDraft({ ...courseDraft, teacherId: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-credits">Credits</Label>
              <Input
                id="c-credits"
                value={courseDraft.credits}
                onChange={(e) => setCourseDraft({ ...courseDraft, credits: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCourse}>{editingCourse ? "Save changes" : "Add course"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
