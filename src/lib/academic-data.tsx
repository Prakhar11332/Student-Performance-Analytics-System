import { createContext, useContext, useMemo, useState } from "react";

export type Course = {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  credits: number;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
  active: boolean;
};

/** One course record for one student: marks out of 100 and attendance percentage. */
export type Enrollment = {
  courseId: string;
  marks: number;
  attendance: number;
};

export type StudentRecord = {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  program: string;
  year: string;
  enrollments: Enrollment[];
  academicRecords: AcademicRecord[];
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  year: string;
  semester: string;
  credits: number;
};

export type AcademicRecord = {
  subjectId: string;
  attemptNumber: number;
  marksObtained: number;
  maxMarks: number;
  status: "passed" | "backlog" | "pending";
  examDate: string;
};

const seedTeachers: Teacher[] = [
  { id: "t-1", name: "Dr. Neha Raghavan", email: "n.raghavan@univ.edu", department: "Computer Science", active: true },
  { id: "t-2", name: "Prof. Ilan Cardoza", email: "i.cardoza@univ.edu", department: "Computer Science", active: true },
  { id: "t-3", name: "Dr. Meera Shah", email: "m.shah@univ.edu", department: "Mathematics", active: false },
];

const seedCourses: Course[] = [
  { id: "c-dbms", code: "CS-304", name: "Database Systems", teacherId: "t-1", credits: 4 },
  { id: "c-os", code: "CS-306", name: "Operating Systems", teacherId: "t-1", credits: 4 },
  { id: "c-dsa", code: "CS-201", name: "Data Structures", teacherId: "t-2", credits: 3 },
];

export const seedSubjects: Subject[] = [
  { id: "sub-1", code: "CS-101", name: "Introduction to Programming", year: "1st Year", semester: "Sem 1", credits: 4 },
  { id: "sub-2", code: "MA-101", name: "Engineering Mathematics I", year: "1st Year", semester: "Sem 1", credits: 4 },
  { id: "sub-3", code: "CS-201", name: "Data Structures", year: "2nd Year", semester: "Sem 3", credits: 4 },
  { id: "sub-4", code: "CS-202", name: "Digital Logic", year: "2nd Year", semester: "Sem 3", credits: 3 },
  { id: "sub-5", code: "CS-304", name: "Database Systems", year: "3rd Year", semester: "Sem 5", credits: 4 },
];

const studentNames = [
  "Aarav Menon",
  "Ishita Bose",
  "Karan Deshpande",
  "Liya Fernandes",
  "Mihir Kulkarni",
  "Nandini Rao",
  "Omar Sheikh",
  "Priya Venkatesh",
  "Rehan Qureshi",
  "Sara Thomas",
  "Tanvi Iyer",
  "Vikram Nair",
];

const seedStudents: StudentRecord[] = studentNames.map((name, index) => {
  const courseIds = index % 4 === 3 ? ["c-dbms", "c-dsa"] : ["c-dbms", "c-os", "c-dsa"];
  return {
    id: index === 0 ? "S-2201" : `S-22${String(index + 1).padStart(2, "0")}`,
    name,
    rollNo: `22CS${String(index + 101).padStart(3, "0")}`,
    email: `${name.toLowerCase().split(" ").join(".")}@student.univ.edu`,
    program: "B.Tech Computer Science",
    year: "Third year",
    enrollments: courseIds.map((courseId, i) => ({
      courseId,
      marks: 44 + ((index * 7 + i * 13) % 52),
      attendance: 62 + ((index * 5 + i * 9) % 38),
    })),
    academicRecords: [
      { subjectId: "sub-1", attemptNumber: 1, marksObtained: 78, maxMarks: 100, status: "passed", examDate: "2023-12-15" },
      { subjectId: "sub-2", attemptNumber: 1, marksObtained: index === 0 ? 35 : 65, maxMarks: 100, status: index === 0 ? "backlog" : "passed", examDate: "2023-12-18" },
      ...(index === 0 ? [{ subjectId: "sub-2", attemptNumber: 2, marksObtained: 72, maxMarks: 100, status: "passed" as const, examDate: "2024-06-10" }] : []),
      { subjectId: "sub-3", attemptNumber: 1, marksObtained: 85, maxMarks: 100, status: "passed", examDate: "2024-12-12" },
      { subjectId: "sub-4", attemptNumber: 1, marksObtained: 40, maxMarks: 100, status: "passed", examDate: "2024-12-15" },
      { subjectId: "sub-5", attemptNumber: 1, marksObtained: 0, maxMarks: 100, status: "pending", examDate: "2025-05-10" },
    ],
  };
});

export const CURRENT_STUDENT_ID = "S-2201";

export const gradeFor = (marks: number) =>
  marks >= 90 ? "A" : marks >= 80 ? "B" : marks >= 70 ? "C" : marks >= 60 ? "D" : marks >= 40 ? "E" : "F";

export type Tone = "good" | "warn" | "bad";

export const marksTone = (marks: number): Tone => (marks >= 70 ? "good" : marks >= 50 ? "warn" : "bad");
export const attendanceTone = (pct: number): Tone => (pct >= 85 ? "good" : pct >= 75 ? "warn" : "bad");

export const average = (values: number[]) =>
  values.length === 0 ? 0 : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

type AcademicValue = {
  teachers: Teacher[];
  courses: Course[];
  subjects: Subject[];
  students: StudentRecord[];
  courseById: (id: string) => Course | undefined;
  subjectById: (id: string) => Subject | undefined;
  teacherById: (id: string) => Teacher | undefined;
  studentById: (id: string) => StudentRecord | undefined;
  addStudent: (student: Omit<StudentRecord, "id">) => void;
  updateStudent: (id: string, patch: Partial<Omit<StudentRecord, "id">>) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, patch: Partial<Omit<Teacher, "id">>) => void;
  deleteTeacher: (id: string) => void;
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, patch: Partial<Omit<Course, "id">>) => void;
  deleteCourse: (id: string) => void;
};

const AcademicContext = createContext<AcademicValue | null>(null);

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}`;

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>(seedTeachers);
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [subjects, setSubjects] = useState<Subject[]>(seedSubjects);
  const [students, setStudents] = useState<StudentRecord[]>(seedStudents);

  const value = useMemo<AcademicValue>(
    () => ({
      teachers,
      courses,
      subjects,
      students,
      courseById: (id) => courses.find((c) => c.id === id),
      subjectById: (id) => subjects.find((s) => s.id === id),
      teacherById: (id) => teachers.find((t) => t.id === id),
      studentById: (id) => students.find((s) => s.id === id),
      addStudent: (student) =>
        setStudents((prev) => [...prev, { ...student, id: nextId("S"), academicRecords: [] }]),
      updateStudent: (id, patch) =>
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      deleteStudent: (id) => setStudents((prev) => prev.filter((s) => s.id !== id)),
      addTeacher: (teacher) => setTeachers((prev) => [...prev, { ...teacher, id: nextId("t") }]),
      updateTeacher: (id, patch) =>
        setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTeacher: (id) => setTeachers((prev) => prev.filter((t) => t.id !== id)),
      addCourse: (course) => setCourses((prev) => [...prev, { ...course, id: nextId("c") }]),
      updateCourse: (id, patch) =>
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      deleteCourse: (id) => {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setStudents((prev) =>
          prev.map((s) => ({ ...s, enrollments: s.enrollments.filter((e) => e.courseId !== id) })),
        );
      },
    }),
    [teachers, courses, students],
  );

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error("useAcademic must be used inside <AcademicProvider>");
  return ctx;
}

/** Convenience hook: the signed-in student's own record. */
export function useCurrentStudent(studentId = CURRENT_STUDENT_ID) {
  const { students } = useAcademic();
  return students.find((s) => s.id === studentId) ?? students[0]!;
}
