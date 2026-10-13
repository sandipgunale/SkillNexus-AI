import { useNavigate } from "react-router-dom";

import { useDashboard } from "./useDashboard";

function DashboardPage() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    queryErrors,
    isFetching,
  } = useDashboard();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error?.message}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050605]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-white/[0.07]">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#95d600] sm:text-[11px]">
                Overview
              </p>

              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#f4f6f3] sm:text-3xl">
                {getGreeting(data?.user)}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                See where you stand, understand your skill gaps,
                and know what to focus on next.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/resume")}
              className="w-full rounded-md border border-[#95d600]/30 bg-[#95d600]/[0.06] px-4 py-2.5 text-sm font-medium text-[#95d600] transition-colors hover:border-[#95d600]/50 hover:bg-[#95d600]/[0.1] sm:w-fit"
            >
              Analyze Resume
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          DASHBOARD CONTENT
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        {isFetching && (
          <div className="mb-4 flex items-center justify-end">
            <span className="text-[10px] text-white/25">
              Updating intelligence...
            </span>
          </div>
        )}

        {/* ===================================================
            TOP INTELLIGENCE ROW
        =================================================== */}

        <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
          <ReadinessCard
            readiness={data?.readiness}
            hasError={Boolean(
              queryErrors?.readiness
            )}
            navigate={navigate}
          />

          <ResumeMetricCard
            resumes={data?.resumes}
            hasError={Boolean(
              queryErrors?.resumes
            )}
            navigate={navigate}
          />

          <PreparationMetricCard
            preparationPlans={
              data?.preparationPlans
            }
            hasError={Boolean(
              queryErrors?.preparationPlans
            )}
            navigate={navigate}
          />
        </section>

        {/* ===================================================
            SECOND ROW
        =================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <SkillIntelligence
            skillDashboard={
              data?.skillDashboard
            }
            skillProgress={
              data?.skillProgress
            }
            hasError={
              Boolean(
                queryErrors?.skillDashboard
              ) ||
              Boolean(
                queryErrors?.skillProgress
              )
            }
            navigate={navigate}
          />

          <PriorityFocus
            skillProgress={
              data?.skillProgress
            }
            preparationPlans={
              data?.preparationPlans
            }
            hasError={
              Boolean(
                queryErrors?.skillProgress
              ) ||
              Boolean(
                queryErrors?.preparationPlans
              )
            }
            navigate={navigate}
          />
        </section>

        {/* ===================================================
            THIRD ROW
        =================================================== */}

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <JobIntelligence
            jobs={data?.jobs}
            hasError={Boolean(
              queryErrors?.jobs
            )}
            navigate={navigate}
          />

          <RecentActivity
            resumes={data?.resumes}
            assessments={
              data?.assessments
            }
            interviews={
              data?.interviews
            }
            jobs={data?.jobs}
            preparationPlans={
              data?.preparationPlans
            }
            hasError={
              Boolean(
                queryErrors?.resumes
              ) ||
              Boolean(
                queryErrors?.assessments
              ) ||
              Boolean(
                queryErrors?.interviews
              ) ||
              Boolean(
                queryErrors?.jobs
              ) ||
              Boolean(
                queryErrors?.preparationPlans
              )
            }
          />
        </section>

        {/* ===================================================
            AI CAREER COACH
        =================================================== */}

        <section className="mt-5">
          <CareerCoachCard
            navigate={navigate}
          />
        </section>
      </main>
    </div>
  );
}

/* ============================================================
   READINESS CARD
============================================================ */

function ReadinessCard({
  readiness,
  hasError,
  navigate,
}) {
  if (hasError) {
    return (
      <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
        <SectionHeader
          eyebrow="Career readiness"
          title="Overall readiness"
          action="View skills"
          onAction={() =>
            navigate("/skills")
          }
        />

        <SectionError
          message="Readiness data could not be loaded."
        />
      </section>
    );
  }

  const rawScore =
    readiness?.readinessScore;

  const score =
    rawScore === null ||
    rawScore === undefined
      ? null
      : normalizeScore(rawScore);

  const level =
    readiness?.readinessLevel ||
    (score === null
      ? null
      : getReadinessLevel(score));

  const trackedSkills =
    readiness?.trackedSkills;

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Career readiness"
        title="Overall readiness"
        action="View skills"
        onAction={() =>
          navigate("/skills")
        }
      />

      {score === null ? (
        <EmptyState
          message="Your readiness score will appear here after enough career intelligence data is available."
          action="Build your skill profile"
          onAction={() =>
            navigate("/skills")
          }
        />
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-5 sm:mt-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-[-0.06em] text-[#f4f6f3] sm:text-6xl">
                  {score}
                </span>

                <span className="mb-2 text-sm text-white/30">
                  / 100
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-white/65">
                {formatReadinessLevel(level)}
              </p>
            </div>

            <span className="w-fit rounded-full border border-[#95d600]/20 bg-[#95d600]/[0.06] px-2.5 py-1 text-[10px] font-medium text-[#95d600]">
              {score}%
            </span>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#95d600] transition-all duration-500"
              style={{
                width: `${score}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
            <span className="text-white/30">
              {trackedSkills !== null &&
              trackedSkills !== undefined
                ? `${trackedSkills} tracked skill${
                    Number(trackedSkills) === 1
                      ? ""
                      : "s"
                  }`
                : "Tracked skills unavailable"}
            </span>

            <span className="text-white/50">
              Readiness
            </span>
          </div>
        </>
      )}
    </section>
  );
}

/* ============================================================
   RESUME METRIC
============================================================ */

function ResumeMetricCard({
  resumes,
  hasError,
  navigate,
}) {
  const resumeList = Array.isArray(
    resumes
  )
    ? resumes
    : [];

  const latestResume =
    getLatestRecord(resumeList);

  if (hasError) {
    return (
      <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
        <SectionHeader
          eyebrow="Resume"
          title="Resume Intelligence"
          action="Open resume"
          onAction={() =>
            navigate("/resume")
          }
        />

        <SectionError
          message="Resume data could not be loaded."
        />
      </section>
    );
  }

  if (!latestResume) {
    return (
      <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
        <SectionHeader
          eyebrow="Resume"
          title="Resume Intelligence"
          action="Open resume"
          onAction={() =>
            navigate("/resume")
          }
        />

        <EmptyState
          message="Add your resume to start building your career intelligence profile."
          action="Add resume"
          onAction={() =>
            navigate("/resume")
          }
        />
      </section>
    );
  }

  const analyzed =
    latestResume?.analysisAvailable ===
      true ||
    latestResume?.analyzed === true ||
    latestResume?.analysisStatus ===
      "COMPLETED";

  const resumeScore =
    getResumeScore(latestResume);

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Resume"
        title="Resume Intelligence"
        action="Open resume"
        onAction={() =>
          navigate("/resume")
        }
      />

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/75">
              {latestResume.fileName ||
                latestResume.name ||
                "Latest resume"}
            </p>

            <p className="mt-1 text-[11px] text-white/30">
              {resumeList.length} resume
              {resumeList.length === 1
                ? ""
                : "s"} in your profile
            </p>
          </div>

          <span
            className={[
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium",
              analyzed
                ? "border-[#95d600]/20 bg-[#95d600]/[0.06] text-[#95d600]"
                : "border-white/[0.08] bg-white/[0.02] text-white/40",
            ].join(" ")}
          >
            {analyzed
              ? "Analyzed"
              : "Pending"}
          </span>
        </div>

        {resumeScore !== null ? (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                  Overall score
                </p>

                <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#f4f6f3]">
                  {resumeScore}
                  <span className="ml-1 text-sm font-normal text-white/30">
                    / 100
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#95d600]"
                style={{
                  width: `${resumeScore}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-white/[0.08] p-4">
            <p className="text-xs font-medium text-white/60">
              {analyzed
                ? "Analysis completed"
                : "Ready to analyze"}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/30">
              {analyzed
                ? "Open your resume to review the detailed analysis and score."
                : "Open your resume to run the available AI analysis."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   PREPARATION METRIC
============================================================ */

function PreparationMetricCard({
  preparationPlans,
  hasError,
  navigate,
}) {
  const plans = Array.isArray(
    preparationPlans
  )
    ? preparationPlans
    : [];

  const latestPlan =
    getLatestRecord(plans);

  if (hasError) {
    return (
      <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
        <SectionHeader
          eyebrow="Preparation"
          title="Preparation Progress"
          action="View plan"
          onAction={() =>
            navigate("/preparation")
          }
        />

        <SectionError
          message="Preparation data could not be loaded."
        />
      </section>
    );
  }

  if (!latestPlan) {
    return (
      <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
        <SectionHeader
          eyebrow="Preparation"
          title="Preparation Progress"
          action="View plan"
          onAction={() =>
            navigate("/preparation")
          }
        />

        <EmptyState
          message="Create a preparation plan to turn your skill gaps into focused actions."
          action="Create preparation plan"
          onAction={() =>
            navigate("/preparation")
          }
        />
      </section>
    );
  }

  const progress =
    calculatePreparationProgress(
      latestPlan
    );

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Preparation"
        title="Preparation Progress"
        action="View plan"
        onAction={() =>
          navigate("/preparation")
        }
      />

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/75">
              {latestPlan.title ||
                "Preparation plan"}
            </p>

            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/30">
              {latestPlan.description ||
                "Your current preparation roadmap."}
            </p>
          </div>

          <span className="shrink-0 text-2xl font-semibold tracking-[-0.03em] text-[#f4f6f3] sm:text-3xl">
            {progress}%
          </span>
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#95d600] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-3 text-[11px] text-white/30">
          {getPreparationProgressText(
            latestPlan
          )}
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   SKILL INTELLIGENCE
============================================================ */

function SkillIntelligence({
  skillDashboard,
  skillProgress,
  hasError,
  navigate,
}) {
  const skills = getSkillItems(
    skillProgress,
    skillDashboard
  );

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Skill intelligence"
        title="Your technical profile"
        action="View skills"
        onAction={() =>
          navigate("/skills")
        }
      />

      {hasError && skills.length === 0 ? (
        <SectionError
          message="Skill intelligence could not be loaded."
        />
      ) : skills.length === 0 ? (
        <EmptyState
          message="No skill intelligence available yet."
          action="Build your skill profile"
          onAction={() =>
            navigate("/skills")
          }
        />
      ) : (
        <div className="mt-6 space-y-5 sm:mt-7">
          {skills
            .slice(0, 5)
            .map((skill) => (
              <div
                key={
                  skill.id ||
                  skill.name
                }
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="min-w-0 truncate text-xs font-medium text-white/65">
                    {skill.name}
                  </span>

                  <span className="shrink-0 text-[11px] text-white/30">
                    {skill.score !== null
                      ? `${skill.score}%`
                      : "—"}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-[#95d600] transition-all duration-500"
                    style={{
                      width: `${
                        skill.score ?? 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   PRIORITY FOCUS
============================================================ */

function PriorityFocus({
  skillProgress,
  preparationPlans,
  hasError,
  navigate,
}) {
  const priorities =
    buildPriorityItems(
      skillProgress,
      preparationPlans
    );

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Next focus"
        title="Priority areas"
        action="View plan"
        onAction={() =>
          navigate("/preparation")
        }
      />

      {hasError &&
      priorities.length === 0 ? (
        <SectionError
          message="Priority data could not be loaded."
        />
      ) : priorities.length === 0 ? (
        <EmptyState
          message="No priority areas identified yet."
          action="View preparation"
          onAction={() =>
            navigate("/preparation")
          }
        />
      ) : (
        <div className="mt-6 divide-y divide-white/[0.06]">
          {priorities.map(
            (item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/70">
                    {item.title}
                  </p>

                  <p className="mt-1 text-[11px] text-white/30">
                    {item.type}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium",
                    item.priority ===
                    "HIGH"
                      ? "border border-[#95d600]/20 bg-[#95d600]/[0.06] text-[#95d600]"
                      : "border border-white/[0.08] bg-white/[0.03] text-white/40",
                  ].join(" ")}
                >
                  {formatPriority(
                    item.priority
                  )}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   JOB INTELLIGENCE
============================================================ */

function JobIntelligence({
  jobs,
  hasError,
  navigate,
}) {
  const jobList = Array.isArray(jobs)
    ? jobs
    : [];

  const latestJob =
    getLatestRecord(jobList);

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Job intelligence"
        title="Latest job intelligence"
        action="Explore jobs"
        onAction={() =>
          navigate("/jobs")
        }
      />

      {hasError && !latestJob ? (
        <SectionError
          message="Job intelligence could not be loaded."
        />
      ) : !latestJob ? (
        <EmptyState
          message="No job description has been added yet."
          action="Analyze a job description"
          onAction={() =>
            navigate("/jobs")
          }
        />
      ) : (
        <div className="mt-6">
          <p className="break-words text-lg font-semibold tracking-[-0.02em] text-white/80">
            {getJobTitle(latestJob)}
          </p>

          <p className="mt-2 line-clamp-4 text-xs leading-5 text-white/30">
            {getJobDescription(
              latestJob
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <InfoPill
              label="Status"
              value={
                latestJob.status ||
                "Available"
              }
            />

            {getRequirementCount(
              latestJob
            ) !== null && (
              <InfoPill
                label="Requirements"
                value={getRequirementCount(
                  latestJob
                )}
              />
            )}
          </div>

          <p className="mt-5 text-[11px] leading-5 text-white/25">
            Resume match score is calculated only when
            you explicitly match a resume against this
            job description.
          </p>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   RECENT ACTIVITY
============================================================ */

function RecentActivity({
  resumes,
  assessments,
  interviews,
  jobs,
  preparationPlans,
  hasError,
}) {
  const activities =
    buildRecentActivity(
      resumes,
      assessments,
      interviews,
      jobs,
      preparationPlans
    );

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5 sm:p-6 lg:p-7">
      <SectionHeader
        eyebrow="Activity"
        title="Recent activity"
      />

      {hasError &&
      activities.length === 0 ? (
        <SectionError
          message="Recent activity could not be loaded."
        />
      ) : activities.length === 0 ? (
        <EmptyState
          message="Your recent activity will appear here."
        />
      ) : (
        <div className="mt-5 divide-y divide-white/[0.06] sm:mt-6">
          {activities.map(
            (activity, index) => (
              <div
                key={`${activity.type}-${activity.id}-${index}`}
                className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#95d600]" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/60">
                    {activity.title}
                  </p>

                  {activity.description && (
                    <p className="mt-1 truncate text-[10px] text-white/20">
                      {activity.description}
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-[10px] text-white/25">
                  {activity.time}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   CAREER COACH
============================================================ */

function CareerCoachCard({
  navigate,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#95d600]/15 bg-[#080a08]">
      <div className="flex flex-col gap-6 p-5 sm:p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#95d600]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#95d600]">
              AI Career Coach
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#f4f6f3] sm:text-2xl">
            Not sure what to work on next?
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/35">
            Ask SkillNexus AI about your skills,
            preparation plan, resume, job matches, or
            interview readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/career-coach")
          }
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-[#95d600] px-5 py-3 text-sm font-semibold text-[#050605] transition-colors hover:bg-[#a6ed08] sm:w-fit"
        >
          Open Career Coach

          <span>→</span>
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}) {
  return (
    <div className="flex items-start justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
          {eyebrow}
        </p>

        <h2 className="mt-1.5 text-base font-semibold tracking-[-0.02em] text-white/80">
          {title}
        </h2>
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-[10px] font-medium text-white/35 transition-colors hover:text-[#95d600] sm:text-[11px]"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  message,
  action,
  onAction,
}) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-white/[0.07] px-4 py-7 text-center sm:mt-7 sm:px-5 sm:py-8">
      <p className="mx-auto max-w-md text-xs leading-5 text-white/30">
        {message}
      </p>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-xs font-medium text-[#95d600] transition-colors hover:text-[#b6e66c]"
        >
          {action}
          <span className="ml-1.5">
            →
          </span>
        </button>
      )}
    </div>
  );
}

/* ============================================================
   SECTION ERROR
============================================================ */

function SectionError({
  message,
}) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-white/[0.08] p-4 sm:mt-7">
      <p className="text-xs font-medium text-white/55">
        Unable to load this section
      </p>

      <p className="mt-1 text-[11px] leading-5 text-white/25">
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   INFO PILL
============================================================ */

function InfoPill({
  label,
  value,
}) {
  return (
    <div className="min-w-[100px] rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 max-w-[160px] truncate text-xs font-medium text-white/60">
        {formatValue(value)}
      </p>
    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050605]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="animate-pulse">
          <div className="h-3 w-20 rounded bg-white/[0.06]" />

          <div className="mt-4 h-8 w-full max-w-sm rounded bg-white/[0.06]" />

          <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/[0.04]" />

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-64 rounded-xl border border-white/[0.07] bg-[#080a08] sm:h-56" />
  );
}

/* ============================================================
   ERROR
============================================================ */

function DashboardError({
  message,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050605] px-5">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-red-400/20 bg-red-400/[0.05] text-red-300">
          !
        </div>

        <h1 className="mt-5 text-lg font-semibold text-white/80">
          Dashboard couldn't load
        </h1>

        <p className="mt-2 text-sm leading-6 text-white/35">
          We couldn't retrieve your SkillNexus
          data. Please check the connection and try
          again.
        </p>

        {import.meta.env.DEV &&
          message && (
            <p className="mt-4 break-words rounded-md bg-white/[0.03] p-3 text-left text-[11px] text-white/25">
              {message}
            </p>
          )}

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-6 rounded-md border border-white/10 px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   DATA HELPERS
============================================================ */

function getGreeting(user) {
  const name =
    user?.name?.trim() ||
    user?.firstName?.trim();

  if (!name) {
    return "Your readiness at a glance.";
  }

  const hour = new Date().getHours();

  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  return `${greeting}, ${name}.`;
}

function normalizeScore(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.min(
    Math.max(Math.round(number), 0),
    100
  );
}

function getReadinessLevel(score) {
  if (score >= 80) {
    return "READY";
  }

  if (score >= 60) {
    return "DEVELOPING";
  }

  return "BUILDING";
}

function formatReadinessLevel(level) {
  if (!level) {
    return "Not available";
  }

  return String(level)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatPriority(priority) {
  return String(
    priority || "MEDIUM"
  )
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

/* ============================================================
   LATEST RECORD
============================================================ */

function getLatestRecord(records) {
  if (
    !Array.isArray(records) ||
    records.length === 0
  ) {
    return null;
  }

  return [...records].sort(
    (first, second) =>
      getRecordTimestamp(second) -
      getRecordTimestamp(first)
  )[0];
}

function getRecordTimestamp(record) {
  if (!record) {
    return 0;
  }

  const timestamp =
    record.updatedAt ||
    record.completedAt ||
    record.createdAt ||
    record.startedAt;

  if (!timestamp) {
    return 0;
  }

  const parsed =
    new Date(timestamp).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

/* ============================================================
   RESUME HELPERS
============================================================ */

function getResumeScore(resume) {
  if (!resume) {
    return null;
  }

  const candidates = [
    resume.overallScore,
    resume.resumeScore,
    resume.score,
    resume.analysis?.overallScore,
    resume.analysis?.score,
  ];

  for (const candidate of candidates) {
    const score =
      normalizeScore(candidate);

    if (score !== null) {
      return score;
    }
  }

  return null;
}

/* ============================================================
   SKILL HELPERS
============================================================ */

function getSkillItems(
  skillProgress,
  skillDashboard
) {
  const progressItems =
    Array.isArray(skillProgress)
      ? skillProgress
      : [];

  const dashboardSkills =
    Array.isArray(
      skillDashboard?.skills
    )
      ? skillDashboard.skills
      : [];

  const source =
    progressItems.length > 0
      ? progressItems
      : dashboardSkills;

  const mapped = source
    .map((skill) => {
      const name =
        getSkillName(skill);

      if (!name) {
        return null;
      }

      const score =
        getSkillScore(skill);

      return {
        id:
          skill?.technologyId ||
          skill?.technology?.id ||
          skill?.id ||
          name,
        name,
        score,
      };
    })
    .filter(Boolean);

  const unique = new Map();

  for (const skill of mapped) {
    const key =
      skill.name.toLowerCase();

    const existing =
      unique.get(key);

    if (!existing) {
      unique.set(key, skill);
      continue;
    }

    if (
      existing.score === null &&
      skill.score !== null
    ) {
      unique.set(key, skill);
    }
  }

  return Array.from(
    unique.values()
  ).sort((first, second) => {
    const firstScore =
      first.score ?? -1;

    const secondScore =
      second.score ?? -1;

    return (
      secondScore - firstScore
    );
  });
}

function getSkillName(skill) {
  if (!skill) {
    return null;
  }

  const candidates = [
    skill.technologyName,
    skill.skillName,
    skill.name,
    skill.technology?.name,
    skill.technology?.technologyName,
    skill.technology?.title,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return null;
}

function getSkillScore(skill) {
  if (!skill) {
    return null;
  }

  const candidates = [
    skill.overallScore,
    skill.score,
    skill.assessmentScore,
  ];

  for (const candidate of candidates) {
    const score =
      normalizeScore(candidate);

    if (score !== null) {
      return score;
    }
  }

  return null;
}

/* ============================================================
   PRIORITY HELPERS
============================================================ */

function buildPriorityItems(
  skillProgress,
  preparationPlans
) {
  const items = [];

  const progressItems =
    Array.isArray(skillProgress)
      ? skillProgress
      : [];

  const weakSkills = progressItems
    .map((skill) => ({
      name:
        getSkillName(skill),
      score:
        getSkillScore(skill),
    }))
    .filter(
      (skill) =>
        skill.name &&
        skill.score !== null
    )
    .filter(
      (skill) => skill.score < 70
    )
    .sort(
      (first, second) =>
        first.score - second.score
    );

  for (const skill of weakSkills) {
    if (items.length >= 3) {
      break;
    }

    items.push({
      title: skill.name,
      type: "Skill development",
      priority:
        skill.score < 50
          ? "HIGH"
          : "MEDIUM",
    });
  }

  if (items.length >= 3) {
    return items;
  }

  const plans = Array.isArray(
    preparationPlans
  )
    ? preparationPlans
    : [];

  const latestPlan =
    getLatestRecord(plans);

  const planItems =
    latestPlan?.items ||
    latestPlan?.tasks ||
    latestPlan?.steps ||
    [];

  if (!Array.isArray(planItems)) {
    return items;
  }

  for (const item of planItems) {
    if (items.length >= 3) {
      break;
    }

    const title =
      item?.skill ||
      item?.skillName ||
      item?.technologyName ||
      item?.title ||
      item?.name;

    if (
      !title ||
      typeof title !== "string"
    ) {
      continue;
    }

    const duplicate =
      items.some(
        (existing) =>
          existing.title.toLowerCase() ===
          title.toLowerCase()
      );

    if (duplicate) {
      continue;
    }

    items.push({
      title,
      type: "Preparation",
      priority:
        String(
          item?.priority || "MEDIUM"
        ).toUpperCase() === "HIGH"
          ? "HIGH"
          : "MEDIUM",
    });
  }

  return items.slice(0, 3);
}

/* ============================================================
   PREPARATION HELPERS
============================================================ */

function calculatePreparationProgress(
  plan
) {
  if (!plan) {
    return 0;
  }

  if (
    plan.progressPercentage !==
      null &&
    plan.progressPercentage !==
      undefined
  ) {
    return normalizeScore(
      plan.progressPercentage
    );
  }

  if (
    plan.progress !== null &&
    plan.progress !== undefined
  ) {
    return normalizeScore(
      plan.progress
    );
  }

  const items =
    plan.items ||
    plan.tasks ||
    plan.steps ||
    [];

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return 0;
  }

  const completed =
    items.filter((item) => {
      if (item?.completed === true) {
        return true;
      }

      const status =
        String(
          item?.status || ""
        ).toUpperCase();

      return [
        "COMPLETED",
        "COMPLETE",
        "DONE",
      ].includes(status);
    }).length;

  return Math.round(
    (completed / items.length) * 100
  );
}

function getPreparationProgressText(
  plan
) {
  const items =
    plan?.items ||
    plan?.tasks ||
    plan?.steps ||
    [];

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return "No preparation items available yet.";
  }

  const completed =
    items.filter((item) => {
      if (item?.completed === true) {
        return true;
      }

      const status =
        String(
          item?.status || ""
        ).toUpperCase();

      return [
        "COMPLETED",
        "COMPLETE",
        "DONE",
      ].includes(status);
    }).length;

  return `${completed} of ${
    items.length
  } preparation item${
    items.length === 1
      ? ""
      : "s"
  } completed`;
}

/* ============================================================
   JOB HELPERS
============================================================ */

function getJobTitle(job) {
  return (
    job?.title ||
    job?.jobTitle ||
    job?.position ||
    "Job Description"
  );
}

function getJobDescription(job) {
  return (
    job?.descriptionText ||
    job?.description ||
    job?.jobDescription ||
    "Job intelligence is available for analysis."
  );
}

function getRequirementCount(job) {
  if (!job) {
    return null;
  }

  if (
    Array.isArray(
      job.requirements
    )
  ) {
    return job.requirements.length;
  }

  if (
    Array.isArray(
      job.jobRequirements
    )
  ) {
    return job.jobRequirements.length;
  }

  if (
    job.requirementsCount !==
      null &&
    job.requirementsCount !==
      undefined
  ) {
    return job.requirementsCount;
  }

  if (
    job.requirementCount !==
      null &&
    job.requirementCount !==
      undefined
  ) {
    return job.requirementCount;
  }

  return null;
}

/* ============================================================
   RECENT ACTIVITY
============================================================ */

function buildRecentActivity(
  resumes,
  assessments,
  interviews,
  jobs,
  preparationPlans
) {
  const activities = [];

  const latestResume =
    getLatestRecord(
      Array.isArray(resumes)
        ? resumes
        : []
    );

  if (latestResume) {
    activities.push({
      id:
        latestResume.id ||
        "resume",
      type: "resume",
      title: "Resume activity",
      description:
        latestResume.fileName ||
        "Resume updated",
      timestamp:
        getRecordTimestamp(
          latestResume
        ),
      time: formatRelativeTime(
        latestResume.updatedAt ||
          latestResume.createdAt
      ),
    });
  }

  const latestAssessment =
    getLatestRecord(
      Array.isArray(assessments)
        ? assessments
        : []
    );

  if (latestAssessment) {
    activities.push({
      id:
        latestAssessment.id ||
        "assessment",
      type: "assessment",
      title: "Assessment activity",
      description:
        latestAssessment.technologyName ||
        "Assessment activity",
      timestamp:
        getRecordTimestamp(
          latestAssessment
        ),
      time: formatRelativeTime(
        latestAssessment.updatedAt ||
          latestAssessment.createdAt
      ),
    });
  }

  const latestInterview =
    getLatestRecord(
      Array.isArray(interviews)
        ? interviews
        : []
    );

  if (latestInterview) {
    const score =
      normalizeScore(
        latestInterview.score
      );

    activities.push({
      id:
        latestInterview.id ||
        "interview",
      type: "interview",
      title: "Mock interview activity",
      description:
        latestInterview.technologyName
          ? `${latestInterview.technologyName}${
              score !== null
                ? ` · ${score}/100`
                : ""
            }`
          : "Mock interview activity",
      timestamp:
        getRecordTimestamp(
          latestInterview
        ),
      time: formatRelativeTime(
        latestInterview.completedAt ||
          latestInterview.startedAt
      ),
    });
  }

  const latestJob =
    getLatestRecord(
      Array.isArray(jobs)
        ? jobs
        : []
    );

  if (latestJob) {
    activities.push({
      id:
        latestJob.id ||
        "job",
      type: "job",
      title: "Job description activity",
      description:
        getJobTitle(latestJob),
      timestamp:
        getRecordTimestamp(
          latestJob
        ),
      time: formatRelativeTime(
        latestJob.updatedAt ||
          latestJob.createdAt
      ),
    });
  }

  const latestPlan =
    getLatestRecord(
      Array.isArray(
        preparationPlans
      )
        ? preparationPlans
        : []
    );

  if (latestPlan) {
    activities.push({
      id:
        latestPlan.id ||
        "preparation",
      type: "preparation",
      title:
        "Preparation plan activity",
      description:
        latestPlan.title ||
        "Preparation plan",
      timestamp:
        getRecordTimestamp(
          latestPlan
        ),
      time: formatRelativeTime(
        latestPlan.updatedAt ||
          latestPlan.createdAt
      ),
    });
  }

  return activities
    .sort(
      (first, second) =>
        second.timestamp -
        first.timestamp
    )
    .slice(0, 5);
}

/* ============================================================
   DATE HELPERS
============================================================ */

function formatRelativeTime(
  value
) {
  if (!value) {
    return "Recent";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recent";
  }

  const difference =
    Date.now() -
    date.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (difference < minute) {
    return "Just now";
  }

  if (difference < hour) {
    return `${Math.floor(
      difference / minute
    )}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(
      difference / hour
    )}h ago`;
  }

  if (difference < week) {
    return `${Math.floor(
      difference / day
    )}d ago`;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
    }
  );
}

export default DashboardPage;