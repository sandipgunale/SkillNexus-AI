import { useState } from "react";
import { Link } from "react-router-dom";

const capabilities = [
  {
    number: "01",
    title: "Resume Intelligence",
    description:
      "Turn your resume into a structured technical profile with skills, technologies, evidence, and readiness signals.",
  },
  {
    number: "02",
    title: "Skill Assessment",
    description:
      "Measure your understanding through technology-specific assessments and track how your performance changes.",
  },
  {
    number: "03",
    title: "Interview Intelligence",
    description:
      "Practice realistic technical interviews and receive structured feedback on your answers.",
  },
  {
    number: "04",
    title: "Job Intelligence",
    description:
      "Compare your profile against a job description, identify skill gaps, and understand what to prepare.",
  },
  {
    number: "05",
    title: "Preparation Plans",
    description:
      "Convert identified gaps into a focused preparation plan with priorities and measurable progress.",
  },
  {
    number: "06",
    title: "AI Career Coach",
    description:
      "Ask career and preparation questions while SkillNexus uses your available profile context.",
  },
];

const readinessSignals = [
  {
    label: "Technical skills",
    value: "84",
    status: "Strong",
  },
  {
    label: "Assessment performance",
    value: "76",
    status: "Improving",
  },
  {
    label: "Interview readiness",
    value: "71",
    status: "Developing",
  },
];

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050605] text-[#f4f6f3] selection:bg-[#95d600] selection:text-black">
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050605]/90 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="flex h-[76px] items-center justify-between">
            {/* BRAND */}

            <Link
              to="/"
              className="group flex items-center gap-3"
              aria-label="SkillNexus AI home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#95d600]/40 bg-[#95d600]/[0.06] text-sm font-bold text-[#95d600] transition-colors group-hover:border-[#95d600]/70">
                S
              </span>

              <span className="text-[15px] font-semibold tracking-[-0.025em] text-white/90">
                SkillNexus
                <span className="text-[#95d600]"> AI</span>
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}

            <nav className="hidden items-center gap-9 md:flex">
              <a
                href="#how-it-works"
                className="text-[13px] font-medium text-white/45 transition-colors hover:text-white"
              >
                How it works
              </a>

              <a
                href="#capabilities"
                className="text-[13px] font-medium text-white/45 transition-colors hover:text-white"
              >
                Capabilities
              </a>

              <a
                href="#readiness"
                className="text-[13px] font-medium text-white/45 transition-colors hover:text-white"
              >
                Readiness
              </a>
            </nav>

            {/* DESKTOP ACTIONS */}

            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/login"
                className="px-3 py-2 text-[13px] font-medium text-white/55 transition-colors hover:text-white"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="inline-flex h-10 items-center rounded-md bg-[#95d600] px-5 text-[13px] font-semibold text-black transition-all hover:bg-[#a6ed08] hover:shadow-[0_0_24px_rgba(149,214,0,0.12)]"
              >
                Get started
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/65 transition hover:border-white/20 hover:text-white md:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* MOBILE NAVIGATION */}

          {mobileMenuOpen && (
            <div className="border-t border-white/[0.07] py-4 md:hidden">
              <nav className="flex flex-col">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-white/[0.06] py-3.5 text-sm text-white/60 transition hover:text-white"
                >
                  How it works
                </a>

                <a
                  href="#capabilities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-white/[0.06] py-3.5 text-sm text-white/60 transition hover:text-white"
                >
                  Capabilities
                </a>

                <a
                  href="#readiness"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-white/[0.06] py-3.5 text-sm text-white/60 transition hover:text-white"
                >
                  Readiness
                </a>

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-white/[0.06] py-3.5 text-sm text-white/60 transition hover:text-white"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-[#95d600] px-4 py-3 text-sm font-semibold text-black"
                >
                  Get started
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="relative overflow-hidden border-b border-white/[0.07]">
          {/* subtle technical grid */}

          <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
          </div>

          <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#95d600]/[0.025] blur-[120px]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-77px)] w-full max-w-[1440px] items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24 xl:gap-20">
            {/* HERO COPY */}

            <div className="relative z-10 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-white/[0.09] bg-white/[0.025] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-[#95d600]" />
                Technical readiness intelligence
              </div>

              <h1 className="max-w-[760px] text-[clamp(3.5rem,6.5vw,6.4rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
                Know your
                <br />
                <span className="text-white">technical readiness.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-white/45 sm:text-lg sm:leading-8">
                SkillNexus AI turns your resume, skills, assessments,
                interviews, and target jobs into one measurable picture of
                where you stand—and what to work on next.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex h-12 items-center justify-center rounded-md bg-[#95d600] px-6 text-sm font-semibold text-black transition-all hover:bg-[#a6ed08] hover:shadow-[0_0_30px_rgba(149,214,0,0.13)]"
                >
                  Start measuring
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.015] px-6 text-sm font-medium text-white/65 transition-colors hover:border-white/20 hover:text-white"
                >
                  Explore the platform
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-white/30">
                <span>Resume intelligence</span>
                <span className="h-1 w-1 rounded-full bg-white/15" />
                <span>Skill intelligence</span>
                <span className="h-1 w-1 rounded-full bg-white/15" />
                <span>Interview intelligence</span>
              </div>
            </div>

            {/* PRODUCT INTERFACE */}

            <div className="relative mx-auto w-full max-w-[680px] lg:ml-auto">
              <div className="pointer-events-none absolute -inset-12 bg-[#95d600]/[0.025] blur-[90px]" />

              <div className="relative border border-white/[0.1] bg-[#090b09] shadow-2xl shadow-black/60">
                {/* browser bar */}

                <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                  </div>

                  <span className="text-[9px] font-medium tracking-[0.16em] text-white/20">
                    SKILLNEXUS / READINESS
                  </span>

                  <span className="text-[9px] text-white/20">
                    LIVE PROFILE
                  </span>
                </div>

                {/* application */}

                <div className="grid min-h-[520px] lg:grid-cols-[180px_1fr]">
                  {/* sidebar */}

                  <aside className="hidden border-r border-white/[0.07] bg-[#080a08] p-4 lg:block">
                    <div className="mb-8">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#95d600]/40 bg-[#95d600]/[0.06] text-[10px] font-bold text-[#95d600]">
                          S
                        </span>

                        <span className="text-[11px] font-semibold text-white/70">
                          SkillNexus
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <PreviewNav active label="Overview" />
                      <PreviewNav label="Resume" />
                      <PreviewNav label="Skills" />
                      <PreviewNav label="Assessments" />
                      <PreviewNav label="Interviews" />
                      <PreviewNav label="Jobs" />
                    </div>

                    <div className="mt-10 border-t border-white/[0.07] pt-4">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-white/20">
                        Preparation
                      </p>

                      <div className="mt-3 rounded-sm border border-[#95d600]/10 bg-[#95d600]/[0.035] p-3">
                        <p className="text-[10px] text-white/50">
                          Current focus
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-white/80">
                          Spring Security
                        </p>

                        <div className="mt-3 h-1 bg-white/[0.06]">
                          <div className="h-full w-[64%] bg-[#95d600]" />
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* main dashboard */}

                  <div className="min-w-0">
                    <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#95d600]">
                            Readiness overview
                          </p>

                          <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white/90">
                            Technical profile
                          </h2>
                        </div>

                        <span className="flex items-center gap-1.5 border border-[#95d600]/15 bg-[#95d600]/[0.04] px-2.5 py-1.5 text-[9px] font-medium text-[#95d600]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#95d600]" />
                          ANALYZED
                        </span>
                      </div>
                    </div>

                    <div className="grid border-b border-white/[0.07] sm:grid-cols-[1fr_0.85fr]">
                      <div className="border-b border-white/[0.07] p-6 sm:border-b-0 sm:border-r sm:p-7">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                          Overall readiness
                        </p>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-6xl font-semibold tracking-[-0.07em] text-white">
                            78
                          </span>

                          <span className="text-sm text-white/25">
                            / 100
                          </span>
                        </div>

                        <div className="mt-5 h-1.5 overflow-hidden bg-white/[0.06]">
                          <div className="h-full w-[78%] bg-[#95d600]" />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[9px]">
                          <span className="text-white/25">
                            Current signal
                          </span>

                          <span className="text-[#95d600]">
                            +8 this month
                          </span>
                        </div>
                      </div>

                      <div className="p-6 sm:p-7">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                          Readiness status
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center border border-[#95d600]/20 bg-[#95d600]/[0.05]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="h-4 w-4 text-[#95d600]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12l4 4L19 6"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white/80">
                              Interview Ready
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              Based on current signals
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-7">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                            Skill intelligence
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            Current technical signals
                          </p>
                        </div>

                        <span className="text-[9px] text-white/20">
                          04 tracked
                        </span>
                      </div>

                      <div className="space-y-5">
                        <SkillBar
                          name="Java"
                          score="92"
                          width="92%"
                          status="Strong"
                        />

                        <SkillBar
                          name="Spring Boot"
                          score="84"
                          width="84%"
                          status="Strong"
                        />

                        <SkillBar
                          name="React"
                          score="71"
                          width="71%"
                          status="Developing"
                        />

                        <SkillBar
                          name="SQL"
                          score="76"
                          width="76%"
                          status="Improving"
                        />
                      </div>
                    </div>

                    <div className="grid border-t border-white/[0.07] sm:grid-cols-3">
                      <PreviewMetric
                        label="Resume"
                        value="92"
                        suffix="/100"
                      />

                      <PreviewMetric
                        label="Assessments"
                        value="76"
                        suffix="%"
                      />

                      <PreviewMetric
                        label="Interviews"
                        value="71"
                        suffix="%"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* floating signal */}

              <div className="absolute -bottom-7 -left-5 hidden w-48 border border-white/[0.1] bg-[#090b09] p-4 shadow-xl shadow-black/40 sm:block">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                    Next focus
                  </p>

                  <span className="text-[9px] text-[#95d600]">
                    HIGH
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium text-white/75">
                  Spring Security
                </p>

                <p className="mt-1 text-[9px] leading-4 text-white/30">
                  Skill gap detected from target role.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SIGNAL STRIP
        ========================================================= */}

        <section className="border-b border-white/[0.07]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 lg:px-10">
            <SignalStat
              value="01"
              label="Technical profile"
            />

            <SignalStat
              value="02"
              label="Performance signals"
            />

            <SignalStat
              value="03"
              label="Target-role gaps"
            />

            <SignalStat
              value="04"
              label="Preparation direction"
            />
          </div>
        </section>

        {/* =========================================================
            VALUE STATEMENT
        ========================================================= */}

        <section className="border-b border-white/[0.07]">
          <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#95d600]">
                  A clearer preparation system
                </p>

                <h2 className="mt-6 max-w-5xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white/90 sm:text-5xl lg:text-6xl">
                  Your preparation should be measured by evidence,
                  <span className="text-white/30"> not guesswork.</span>
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-white/40 lg:pb-1">
                SkillNexus connects the signals that normally live in
                separate places—your resume, technical performance,
                interviews, target jobs, and preparation progress.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}

        <section id="how-it-works">
          <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
            <SectionHeading
              eyebrow="THE WORKFLOW"
              title="From profile to preparation."
              description="A focused system built around the questions that actually matter when preparing for a technical role."
            />

            <div className="mt-16 grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
              <WorkflowStep
                number="01"
                title="Understand your profile"
                description="Analyze your resume and identify the technologies and skills your profile actually demonstrates."
              />

              <WorkflowStep
                number="02"
                title="Measure your readiness"
                description="Use assessments and technical interviews to build measurable signals around your current preparation."
              />

              <WorkflowStep
                number="03"
                title="Close the gaps"
                description="Compare your profile with target jobs and turn missing skills into focused preparation."
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            CAPABILITIES
        ========================================================= */}

        <section
          id="capabilities"
          className="border-y border-white/[0.07] bg-[#080a08]"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow="ONE WORKSPACE"
                title="Everything connected to readiness."
                description="SkillNexus is built around your preparation journey—not isolated AI features."
              />

              <p className="max-w-xs text-xs leading-6 text-white/25 lg:pb-1">
                Six connected intelligence layers working from the same
                technical profile.
              </p>
            </div>

            <div className="mt-16 grid border-l border-t border-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => (
                <Capability
                  key={capability.number}
                  number={capability.number}
                  title={capability.title}
                  description={capability.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            READINESS INTELLIGENCE
        ========================================================= */}

        <section id="readiness">
          <div className="mx-auto grid max-w-[1440px] gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-32">
            {/* LEFT */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#95d600]">
                READINESS, NOT NOISE
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">
                Turn scattered preparation into a measurable signal.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/40">
                See how your assessments, interviews, technical skills, and
                job requirements connect. Understand what is strong, what
                needs work, and what to focus on next.
              </p>

              <Link
                to="/register"
                className="group mt-8 inline-flex items-center text-sm font-semibold text-[#95d600] transition-colors hover:text-[#b6e66c]"
              >
                Build your profile
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            {/* RIGHT */}

            <div className="border border-white/[0.09] bg-[#090b09]">
              <div className="border-b border-white/[0.07] px-6 py-5 sm:px-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Readiness signals
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/75">
                      Current technical profile
                    </p>
                  </div>

                  <span className="text-[9px] text-[#95d600]">
                    LIVE SIGNALS
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="space-y-1">
                  {readinessSignals.map((signal) => (
                    <ReadinessSignal
                      key={signal.label}
                      label={signal.label}
                      value={signal.value}
                      status={signal.status}
                    />
                  ))}
                </div>
              </div>

              <div className="grid border-t border-white/[0.07] sm:grid-cols-2">
                <div className="border-b border-white/[0.07] p-6 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                    Primary gap
                  </p>

                  <p className="mt-2 text-sm font-medium text-white/75">
                    Spring Security
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-white/25">
                    Frequently required by target roles.
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                    Recommended action
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#95d600]">
                    Skill reinforcement
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-white/25">
                    Add focused preparation before your next interview.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================= */}

        <section className="border-t border-white/[0.07]">
          <div className="mx-auto max-w-[1440px] px-5 py-24 text-center sm:px-8 lg:px-10 lg:py-36">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#95d600]">
              START WITH WHAT YOU HAVE
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
              Measure your readiness.
              <br />
              <span className="text-white/25">
                Then improve it.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/35">
              Build your technical profile, identify the gaps, and get a
              clearer direction for your next interview.
            </p>

            <Link
              to="/register"
              className="group mt-9 inline-flex h-12 items-center rounded-md bg-[#95d600] px-7 text-sm font-semibold text-black transition-all hover:bg-[#a6ed08] hover:shadow-[0_0_32px_rgba(149,214,0,0.14)]"
            >
              Get started
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-sm font-semibold tracking-[-0.02em]">
              SkillNexus
              <span className="text-[#95d600]"> AI</span>
            </p>

            <p className="mt-1 text-[11px] text-white/25">
              Understand Your Skills. Close the Gaps. Build Your Future.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="text-[11px] text-white/30 transition-colors hover:text-white/60"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="text-[11px] text-white/30 transition-colors hover:text-white/60"
            >
              Get started
            </Link>

            <span className="text-[11px] text-white/20">
              © {new Date().getFullYear()} SkillNexus AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#95d600]">
        {eyebrow}
      </p>

      <h2 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-white/40 sm:text-base">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   WORKFLOW STEP
========================================================= */

function WorkflowStep({
  number,
  title,
  description,
}) {
  return (
    <div className="group bg-[#090b09] p-7 transition-colors hover:bg-[#0c0f0c] sm:p-9 lg:min-h-[280px]">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-[#95d600]">
          {number}
        </span>

        <span className="text-white/10 transition-colors group-hover:text-[#95d600]/30">
          ↗
        </span>
      </div>

      <h3 className="mt-14 max-w-xs text-lg font-semibold tracking-[-0.03em] text-white/85">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-white/35">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   CAPABILITY
========================================================= */

function Capability({
  number,
  title,
  description,
}) {
  return (
    <div className="group min-h-[250px] border-b border-r border-white/[0.08] bg-[#080a08] p-7 transition-colors hover:bg-[#0c0f0c] sm:p-8">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-medium tracking-[0.16em] text-white/20">
          {number}
        </span>

        <span className="text-white/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#95d600]/50">
          ↗
        </span>
      </div>

      <h3 className="mt-16 text-base font-semibold tracking-[-0.02em] text-white/80">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-white/35">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PREVIEW NAV
========================================================= */

function PreviewNav({
  label,
  active = false,
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-sm px-2.5 py-2 text-[10px] transition-colors ${
        active
          ? "bg-[#95d600]/[0.07] text-[#95d600]"
          : "text-white/25 hover:bg-white/[0.025] hover:text-white/50"
      }`}
    >
      <span
        className={`h-1 w-1 rounded-full ${
          active ? "bg-[#95d600]" : "bg-white/10"
        }`}
      />

      {label}
    </div>
  );
}

/* =========================================================
   PREVIEW METRIC
========================================================= */

function PreviewMetric({
  label,
  value,
  suffix,
}) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-[8px] uppercase tracking-[0.14em] text-white/20">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-white/70">
        {value}
        <span className="ml-0.5 text-[9px] font-normal text-white/20">
          {suffix}
        </span>
      </p>
    </div>
  );
}

/* =========================================================
   SKILL BAR
========================================================= */

function SkillBar({
  name,
  score,
  width,
  status,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/55">
            {name}
          </span>

          <span className="text-[8px] text-white/15">
            {status}
          </span>
        </div>

        <span className="text-[10px] text-white/30">
          {score}
        </span>
      </div>

      <div className="h-1 overflow-hidden bg-white/[0.06]">
        <div
          className="h-full bg-[#95d600]"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SIGNAL STAT
========================================================= */

function SignalStat({
  value,
  label,
}) {
  return (
    <div className="border-r border-white/[0.07] px-4 py-5 first:border-l sm:px-6 lg:px-8">
      <p className="text-lg font-semibold tracking-[-0.04em] text-white/75">
        {value}
      </p>

      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   READINESS SIGNAL
========================================================= */

function ReadinessSignal({
  label,
  value,
  status,
}) {
  return (
    <div className="border-b border-white/[0.06] py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-white/70">
            {label}
          </p>

          <p className="mt-1 text-[10px] text-white/25">
            {status}
          </p>
        </div>

        <span className="text-2xl font-semibold tracking-[-0.05em] text-white/80">
          {value}
        </span>
      </div>

      <div className="mt-4 h-1 bg-white/[0.06]">
        <div
          className="h-full bg-[#95d600]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default LandingPage;