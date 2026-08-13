import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { homeForRole, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Retentia Student Performance Analytics" },
      {
        name: "description",
        content:
          "One sign-in for students and faculty. Retentia verifies what students actually retain, week after week.",
      },
      { property: "og:title", content: "Sign in — Retentia" },
      {
        property: "og:description",
        content: "One sign-in for students and faculty. Verified retention analytics, not guesses.",
      },
    ],
  }),
  component: LoginPage,
});

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

function LoginPage() {
  const { signIn, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: homeForRole(user.role), replace: true });
  }, [ready, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const session = await signIn(email, password);
      navigate({ to: homeForRole(session.role), replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cinematic-scope relative min-h-screen overflow-hidden bg-[#001f2b]">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
      />

      <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <span
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Retentia<sup className="text-xs">®</sup>
        </span>
        <div className="hidden items-center gap-8 md:flex">
          {["Home", "Portals", "Method", "Journal", "Reach Us"].map((item, i) => (
            <a
              key={item}
              href="#access"
              className={`text-sm transition-colors hover:text-foreground ${
                i === 0 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item}
            </a>
          ))}
        </div>
        <a
          href="#access"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03]"
        >
          Begin Journey
        </a>
      </nav>

      <section className="relative z-10 flex flex-col items-center px-6 pt-24 pb-24 text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where knowledge{" "}
          <em className="text-muted-foreground not-italic">holds</em> long after the{" "}
          <em className="text-muted-foreground not-italic">lecture ends.</em>
        </h1>
        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Retentia measures what students genuinely retain — verified tests, timed recall checks and
          auto-issued retests. No predicted curves, no guesswork. Just evidence, week after week.
        </p>

        <form
          id="access"
          onSubmit={onSubmit}
          className="animate-fade-rise-delay-2 liquid-glass mt-12 w-full max-w-md rounded-3xl px-7 py-8 text-left"
        >
          <p
            className="text-2xl text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Sign in
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your portal opens automatically based on your account.
          </p>

          <label className="mt-6 block text-xs tracking-wide text-muted-foreground uppercase">
            Institutional email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@univ.edu"
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-white/40 focus:outline-none"
          />

          <label className="mt-4 block text-xs tracking-wide text-muted-foreground uppercase">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-white/40 focus:outline-none"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-[#D64550]/40 bg-[#D64550]/15 px-3 py-2.5 text-sm text-white"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="liquid-glass mt-7 flex w-full items-center justify-center gap-2 rounded-full px-10 py-4 text-base text-foreground hover:scale-[1.02] disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? "Verifying credentials" : "Begin Journey"}
          </button>

          <div className="mt-6 space-y-1 border-t border-white/10 pt-4 text-xs text-muted-foreground">
            <p className="text-foreground/80">Demo accounts</p>
            <p>Student — aarav.menon@student.univ.edu / student123</p>
            <p>Teacher — n.raghavan@univ.edu / teacher123</p>
            <p>Admin — admin@univ.edu / admin123</p>
            <p>Locked — locked@univ.edu / locked123</p>
          </div>
        </form>
      </section>
    </div>
  );
}
