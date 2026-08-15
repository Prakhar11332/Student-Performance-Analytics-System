import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PortalNav } from "@/components/portal-chrome";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/teacher")({
  ssr: false,
  component: TeacherLayout,
});

function TeacherLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/", replace: true });
    if (ready && user?.role === "student") navigate({ to: "/student", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) return <div className="min-h-screen bg-background" />;

  const items = [
    { to: "/teacher", label: "Student Roster" },
    ...(user.role === "admin" ? [{ to: "/teacher/settings", label: "Teachers & Courses" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <PortalNav items={items} title={`Retentia · ${user.role === "admin" ? "Admin" : "Faculty"}`} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
