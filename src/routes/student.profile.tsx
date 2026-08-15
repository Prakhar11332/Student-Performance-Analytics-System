import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { StatusBadge } from "@/components/metrics";
import { PageHeader } from "@/components/portal-chrome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAcademic, useCurrentStudent, type AcademicRecord, type Subject } from "@/lib/academic-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Retentia" },
      { name: "description", content: "Personal details, enrolled courses, marks and attendance summary." },
      { property: "og:title", content: "My profile — Retentia" },
      { property: "og:description", content: "Personal details with marks and attendance summary." },
    ],
  }),
  component: ProfilePage,
});

type SubjectData = {
  subject: Subject;
  attempts: AcademicRecord[];
  latest: AcademicRecord;
};

function ProfilePage() {
  const { user } = useAuth();
  const student = useCurrentStudent();
  const { subjectById } = useAcademic();

  const records = student.academicRecords ?? [];

  const { uniqueSubjectsCount, passedCount, backlogCount, overallPercentage, subjectsByYear, sortedYears } = useMemo(() => {
    // Group all attempts by subjectId
    const attemptsBySubject = new Map<string, AcademicRecord[]>();
    for (const r of records) {
      if (!attemptsBySubject.has(r.subjectId)) attemptsBySubject.set(r.subjectId, []);
      attemptsBySubject.get(r.subjectId)!.push(r);
    }
    
    // Sort attempts descending by attemptNumber
    for (const attempts of attemptsBySubject.values()) {
      attempts.sort((a, b) => b.attemptNumber - a.attemptNumber);
    }

    let passed = 0;
    let backlog = 0;
    let totalObtained = 0;
    let totalMax = 0;

    const byYear = new Map<string, SubjectData[]>();

    for (const [subjectId, attempts] of attemptsBySubject.entries()) {
      const subj = subjectById(subjectId);
      if (!subj) continue;
      
      const latest = attempts[0]!;
      
      if (latest.status === "passed") passed++;
      if (latest.status === "backlog") backlog++;
      
      totalObtained += latest.marksObtained;
      totalMax += latest.maxMarks;

      if (!byYear.has(subj.year)) byYear.set(subj.year, []);
      byYear.get(subj.year)!.push({ subject: subj, attempts, latest });
    }

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const years = Array.from(byYear.keys()).sort();

    return {
      uniqueSubjectsCount: attemptsBySubject.size,
      passedCount: passed,
      backlogCount: backlog,
      overallPercentage: percentage,
      subjectsByYear: byYear,
      sortedYears: years,
    };
  }, [records, subjectById]);

  return (
    <div>
      <PageHeader title="Profile" description="Your details and full academic history." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar: Personal Info */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Personal information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["Name", user?.name ?? student.name],
                ["Student ID", student.id],
                ["Roll number", student.rollNo],
                ["Email", user?.email ?? student.email],
                ["Programme", student.program],
                ["Year", user?.year ?? student.year],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Academic History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-4 bg-card shadow-card">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Subjects</p>
              <p className="mt-1 font-display text-2xl">{uniqueSubjectsCount}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card shadow-card">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Passed</p>
              <p className="mt-1 font-display text-2xl text-status-good">{passedCount}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card shadow-card">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Backlogs</p>
              <p className="mt-1 font-display text-2xl text-status-bad">{backlogCount}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card shadow-card">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Overall %</p>
              <p className="mt-1 font-display text-2xl">{overallPercentage}%</p>
            </div>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Academic History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedYears.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No academic records found.</p>
              ) : (
                <Accordion type="multiple" defaultValue={sortedYears} className="w-full">
                  {sortedYears.map((year) => {
                    const subjects = subjectsByYear.get(year)!;
                    return (
                      <AccordionItem key={year} value={year}>
                        <AccordionTrigger className="hover:no-underline text-base font-semibold">
                          {year}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3 pt-2">
                            {subjects.map(({ subject, attempts, latest }) => (
                              <li
                                key={subject.id}
                                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 text-sm"
                              >
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex-1">
                                    <span className="font-medium text-base">{subject.name}</span>
                                    <span className="ml-2 text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md">{subject.code}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <span className="font-semibold">{latest.marksObtained}</span>
                                      <span className="text-muted-foreground"> / {latest.maxMarks}</span>
                                    </div>
                                    <StatusBadge status={latest.status} />
                                  </div>
                                </div>
                                
                                {attempts.length > 1 && (
                                  <div className="mt-2 pl-4 border-l-2 border-muted space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Previous Attempts</p>
                                    {attempts.slice(1).map(attempt => (
                                      <div key={attempt.attemptNumber} className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="w-16">Attempt {attempt.attemptNumber}</span>
                                        <span>{attempt.marksObtained} / {attempt.maxMarks}</span>
                                        <span className="capitalize">{attempt.status}</span>
                                        <span>({new Date(attempt.examDate).toLocaleDateString()})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
