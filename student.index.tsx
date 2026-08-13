import { createFileRoute } from "@tanstack/react-router";

import { CardSkeletonGrid, useLoaded } from "@/components/loading";
import { AttendancePill, MarksPill, MetricLegend } from "@/components/metrics";
import { EmptyState, PageHeader } from "@/components/portal-chrome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { average, useAcademic, useCurrentStudent } from "@/lib/academic-data";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "My courses — Retentia" },
      {
        name: "description",
        content: "Your enrolled courses with recorded marks and attendance for the current term.",
      },
      { property: "og:title", content: "My courses — Retentia" },
      { property: "og:description", content: "Marks and attendance across every enrolled course." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const loaded = useLoaded();
  const student = useCurrentStudent();
  const { courseById, teacherById } = useAcademic();

  const avgMarks = average(student.enrollments.map((e) => e.marks));
  const avgAttendance = average(student.enrollments.map((e) => e.attendance));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${student.name.split(" ")[0]}`}
        description="Your recorded marks and attendance for every course you are enrolled in this term."
        actions={<MetricLegend />}
      />

      {!loaded ? (
        <CardSkeletonGrid count={3} />
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Courses enrolled", value: `${student.enrollments.length}` },
              { label: "Average marks", value: `${avgMarks}%` },
              { label: "Average attendance", value: `${avgAttendance}%` },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-card">
                <CardContent className="pt-5">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</p>
                  <p className="mt-1 font-display text-2xl">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="mb-3 font-display text-xl">Your courses</h2>
          {student.enrollments.length === 0 ? (
            <EmptyState
              title="No courses yet"
              description="Once the registry enrols you in a course it will appear here with marks and attendance."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {student.enrollments.map((enrollment) => {
                const course = courseById(enrollment.courseId);
                if (!course) return null;
                const teacher = teacherById(course.teacherId);
                return (
                  <Card key={enrollment.courseId} className="shadow-card transition-shadow hover:shadow-lift">
                    <CardHeader className="pb-2">
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        {course.code} · {teacher?.name ?? "Unassigned"}
                      </p>
                      <CardTitle className="font-display text-lg">{course.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Marks</span>
                        <MarksPill marks={enrollment.marks} />
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Attendance</span>
                        <AttendancePill value={enrollment.attendance} />
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                        <span className="text-muted-foreground">Credits</span>
                        <span className="font-medium">{course.credits}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
