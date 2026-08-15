import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PortalNav } from "@/components/portal-chrome";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/student")({
  ssr: false,
  component: StudentLayout,
});

const items = [
  { to: "/student", label: "My Courses" },
  { to: "/student/profile", label: "Profile" },
];

function StudentLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/", replace: true });
    if (ready && user && user.role !== "student") navigate({ to: "/teacher", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background">
      <PortalNav items={items} title="Retentia · Student" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
