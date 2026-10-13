import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  useSkillIntelligence,
} from "./useSkillIntelligence";

function SkillIntelligencePage() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    queryErrors,
  } = useSkillIntelligence();

  const skills = Array.isArray(data.skills)
    ? data.skills
    : [];

  const progress = Array.isArray(data.progress)
    ? data.progress
    : [];

  const readiness = data.readiness;
  const dashboard = data.dashboard;

  const technologyItems = useMemo(() => {
    return buildTechnologyItems(
      skills,
      progress,
      dashboard
    );
  }, [skills, progress, dashboard]);

  if (isLoading) {
    return <SkillPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#050605]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-white/[0.07]">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#95d600]">
                Skill Intelligence
              </p>

              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#f4f6f3] sm:text-3xl">
                Know where you stand.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Track your technology readiness,
                assessment performance, and interview
                progress in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-fit text-xs font-medium text-white/35 transition-colors hover:text-[#95d600]"
            >
              ← Back to dashboard
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {error && (
          <section className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.035] px-5 py-4">
            <p className="text-sm font-medium text-red-300/80">
              Unable to load skill intelligence.
            </p>

            <p className="mt-1 text-xs leading-5 text-white/30">
              {getApiErrorMessage(
                error,
                "Please make sure the backend is running and try again."
              )}
            </p>
          </section>
        )}

        {/* ===================================================
            OVERVIEW
        =================================================== */}

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <ReadinessPanel
            readiness={readiness}
          />

          <SkillSummaryPanel
            skills={skills}
            dashboard={dashboard}
            progress={progress}
          />
        </section>

        {/* ===================================================
            TECHNOLOGY INTELLIGENCE
        =================================================== */}

        <section className="mt-5 rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
                Technology intelligence
              </p>

              <h2 className="mt-1.5 text-base font-semibold tracking-[-0.02em] text-white/80">
                Your technology profile
              </h2>

              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-white/25">
                A consolidated view of the skills
                SkillNexus currently knows about.
              </p>
            </div>

            <span className="w-fit rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/35">
              {technologyItems.length}{" "}
              {technologyItems.length === 1
                ? "technology"
                : "technologies"}
            </span>
          </div>

          {queryErrors?.skills &&
            technologyItems.length > 0 && (
              <InlineWarning message="Some skill information could not be loaded." />
            )}

          {technologyItems.length === 0 ? (
            <EmptySkillState
              onDashboard={() =>
                navigate("/dashboard")
              }
            />
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {technologyItems.map(
                (technology, index) => (
                  <TechnologyCard
                    key={
                      technology.id ??
                      technology.name ??
                      index
                    }
                    technology={technology}
                    onOpen={() => {
                      if (
                        technology.id
                      ) {
                        navigate(
                          `/skills/${technology.id}`
                        );
                      }
                    }}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* ===================================================
            SIGNALS
        =================================================== */}

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <SignalCard
            label="Skill coverage"
            value={formatCount(
              technologyItems.length
            )}
            description="Technologies currently represented in your skill profile."
          />

          <SignalCard
            label="Progress records"
            value={formatCount(
              progress.length
            )}
            description="Technology progress records currently available."
          />

          <SignalCard
            label="Readiness"
            value={getReadinessValue(
              readiness
            )}
            description="Current readiness signal returned by SkillNexus."
          />
        </section>

        {/* ===================================================
            DATA LIMITATION NOTE
        =================================================== */}

        {(queryErrors?.progress ||
          queryErrors?.readiness) && (
          <section className="mt-5 rounded-xl border border-white/[0.08] bg-[#080a08] px-5 py-4">
            <p className="text-xs font-medium text-white/45">
              Some intelligence signals are
              temporarily unavailable.
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/25">
              SkillNexus only displays scores and
              readiness values returned by the backend.
              Missing signals are not estimated or
              fabricated.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

/* ============================================================
   READINESS PANEL
============================================================ */

function ReadinessPanel({
  readiness,
}) {
  const value =
    getNumericValue(
      readiness,
      [
        "readinessScore",
        "overallReadiness",
        "score",
        "overallScore",
        "value",
      ]
    );

  const label =
    getTextValue(
      readiness,
      [
        "level",
        "readinessLevel",
        "status",
        "label",
      ]
    );

  const description =
    getTextValue(
      readiness,
      [
        "message",
        "description",
        "summary",
      ]
    );

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
        Overall readiness
      </p>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-[-0.06em] text-[#f4f6f3]">
              {value !== null
                ? formatScore(value)
                : "—"}
            </span>

            {value !== null && (
              <span className="text-sm text-white/25">
                / 100
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-white/35">
            {label ||
              "Readiness signal"}
          </p>
        </div>

        <div className="w-full max-w-xs sm:w-56">
          <div className="flex items-center justify-between text-[10px] text-white/25">
            <span>Current signal</span>

            <span>
              {value !== null
                ? `${Math.round(
                    clampScore(value)
                  )}%`
                : "—"}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#95d600] transition-all"
              style={{
                width:
                  value !== null
                    ? `${clampScore(
                        value
                      )}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {description && (
        <p className="mt-6 max-w-2xl border-t border-white/[0.06] pt-5 text-xs leading-5 text-white/30">
          {description}
        </p>
      )}
    </section>
  );
}

/* ============================================================
   SKILL SUMMARY
============================================================ */

function SkillSummaryPanel({
  skills,
  dashboard,
  progress,
}) {
  const dashboardCount =
    getNumericValue(
      dashboard,
      [
        "totalSkills",
        "skillCount",
        "totalTechnologies",
        "technologyCount",
      ]
    );

  const strongest =
    getTextValue(
      dashboard,
      [
        "strongestSkill",
        "topSkill",
        "strongestTechnology",
        "topTechnology",
      ]
    );

  const averageScore =
    getNumericValue(
      dashboard,
      [
        "averageScore",
        "overallScore",
        "averageSkillScore",
      ]
    );

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
        Skill overview
      </p>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6">
        <Metric
          label="Technologies"
          value={
            dashboardCount !== null
              ? formatCount(
                  dashboardCount
                )
              : formatCount(
                  skills.length
                )
          }
        />

        <Metric
          label="Progress records"
          value={formatCount(
            progress.length
          )}
        />

        <Metric
          label="Average score"
          value={
            averageScore !== null
              ? `${Math.round(
                  averageScore
                )}`
              : "—"
          }
        />

        <Metric
          label="Strongest area"
          value={
            strongest || "—"
          }
        />
      </div>
    </section>
  );
}

/* ============================================================
   TECHNOLOGY CARD
============================================================ */

function TechnologyCard({
  technology,
  onOpen,
}) {
  const score =
    technology.overallScore;

  const assessmentScore =
    technology.assessmentScore;

  const interviewScore =
    technology.interviewScore;

  const progressValue =
    technology.progress;

  return (
    <article className="group rounded-lg border border-white/[0.07] bg-white/[0.012] p-5 transition-colors hover:border-white/[0.12]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white/70">
            {technology.name}
          </h3>

          {technology.category && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/20">
              {technology.category}
            </p>
          )}
        </div>

        {score !== null && (
          <span className="shrink-0 text-sm font-semibold text-[#95d600]">
            {Math.round(
              score
            )}
          </span>
        )}
      </div>

      {score !== null && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#95d600]"
            style={{
              width: `${clampScore(
                score
              )}%`,
            }}
          />
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMetric
          label="Assessment"
          value={
            assessmentScore !== null
              ? formatScore(
                  assessmentScore
                )
              : "—"
          }
        />

        <MiniMetric
          label="Interview"
          value={
            interviewScore !== null
              ? formatScore(
                  interviewScore
                )
              : "—"
          }
        />
      </div>

      {progressValue !== null && (
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[10px] text-white/25">
            Progress
          </span>

          <span className="text-[10px] font-medium text-white/45">
            {formatScore(
              progressValue
            )}
          </span>
        </div>
      )}

      {technology.id && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 text-[11px] font-medium text-white/30 transition-colors hover:text-[#95d600]"
        >
          View technology →
        </button>
      )}
    </article>
  );
}

/* ============================================================
   GENERIC SIGNAL CARD
============================================================ */

function SignalCard({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080a08] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white/70">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-white/25">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   SMALL METRICS
============================================================ */

function Metric({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </p>

      <p className="mt-1.5 truncate text-sm font-medium text-white/55">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.1em] text-white/20">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-white/40">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptySkillState({
  onDashboard,
}) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-white/[0.07] px-5 py-12 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/30">
        —
      </div>

      <h3 className="mt-4 text-sm font-medium text-white/60">
        No skill intelligence yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/25">
        Add and analyze your resume to start
        building your SkillNexus skill profile.
      </p>

      <button
        type="button"
        onClick={onDashboard}
        className="mt-5 text-xs font-medium text-[#95d600] transition-colors hover:text-[#b6e66c]"
      >
        Back to dashboard
        <span className="ml-1.5">
          →
        </span>
      </button>
    </div>
  );
}

/* ============================================================
   INLINE WARNING
============================================================ */

function InlineWarning({
  message,
}) {
  return (
    <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.015] px-4 py-3">
      <p className="text-[11px] text-white/30">
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function SkillPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#050605]">
      <section className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="h-2.5 w-28 rounded bg-white/[0.05]" />

          <div className="mt-4 h-8 w-72 max-w-full rounded bg-white/[0.05]" />

          <div className="mt-3 h-3 w-full max-w-xl rounded bg-white/[0.04]" />
        </div>
      </section>

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-64" />
        </div>

        <SkeletonBlock className="mt-5 h-96" />

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36" />
        </div>
      </main>
    </div>
  );
}

function SkeletonBlock({
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-[#080a08] ${className}`}
    />
  );
}

/* ============================================================
   TECHNOLOGY NORMALIZATION
============================================================ */

function buildTechnologyItems(
  skills,
  progress,
  dashboard
) {
  const items = new Map();

  addTechnologyCollection(
    items,
    skills
  );

  addTechnologyCollection(
    items,
    extractDashboardTechnologies(
      dashboard
    )
  );

  addProgressCollection(
    items,
    progress
  );

  return Array.from(
    items.values()
  );
}

function addTechnologyCollection(
  items,
  collection
) {
  if (!Array.isArray(collection)) {
    return;
  }

  collection.forEach(
    (item) => {
      const normalized =
        normalizeTechnology(
          item
        );

      if (!normalized.name) {
        return;
      }

      const key =
        normalized.id ??
        normalized.name.toLowerCase();

      const existing =
        items.get(key);

      items.set(
        key,
        mergeTechnology(
          existing,
          normalized
        )
      );
    }
  );
}

function addProgressCollection(
  items,
  collection
) {
  if (!Array.isArray(collection)) {
    return;
  }

  collection.forEach(
    (item) => {
      const normalized =
        normalizeProgress(
          item
        );

      if (!normalized.name) {
        return;
      }

      const key =
        normalized.id ??
        normalized.name.toLowerCase();

      const existing =
        items.get(key);

      items.set(
        key,
        mergeTechnology(
          existing,
          normalized
        )
      );
    }
  );
}

function normalizeTechnology(
  item
) {
  return {
    id:
      item?.technologyId ??
      item?.id ??
      item?.technology?.id ??
      null,

    name:
      item?.technologyName ??
      item?.name ??
      item?.technology?.name ??
      null,

    category:
      item?.category ??
      item?.technology?.category ??
      null,

    overallScore:
      firstNumber(
        item?.overallScore,
        item?.score,
        item?.proficiencyScore
      ),

    assessmentScore:
      firstNumber(
        item?.assessmentScore,
        item?.latestAssessmentScore
      ),

    interviewScore:
      firstNumber(
        item?.interviewScore,
        item?.latestInterviewScore
      ),

    progress:
      firstNumber(
        item?.progress,
        item?.progressScore,
        item?.completionPercentage
      ),
  };
}

function normalizeProgress(
  item
) {
  return {
    id:
      item?.technologyId ??
      item?.technology?.id ??
      null,

    name:
      item?.technologyName ??
      item?.technology?.name ??
      item?.name ??
      null,

    category:
      item?.category ??
      null,

    overallScore:
      firstNumber(
        item?.overallScore,
        item?.score
      ),

    assessmentScore:
      firstNumber(
        item?.assessmentScore
      ),

    interviewScore:
      firstNumber(
        item?.interviewScore
      ),

    progress:
      firstNumber(
        item?.progress,
        item?.progressScore,
        item?.completionPercentage
      ),
  };
}

function mergeTechnology(
  existing,
  incoming
) {
  if (!existing) {
    return incoming;
  }

  return {
    id:
      existing.id ??
      incoming.id,

    name:
      existing.name ??
      incoming.name,

    category:
      existing.category ??
      incoming.category,

    overallScore:
      existing.overallScore ??
      incoming.overallScore,

    assessmentScore:
      existing.assessmentScore ??
      incoming.assessmentScore,

    interviewScore:
      existing.interviewScore ??
      incoming.interviewScore,

    progress:
      existing.progress ??
      incoming.progress,
  };
}

function extractDashboardTechnologies(
  dashboard
) {
  if (!dashboard) {
    return [];
  }

  const possibleCollections = [
    dashboard.technologies,
    dashboard.skills,
    dashboard.skillProgress,
    dashboard.items,
    dashboard.data,
  ];

  return (
    possibleCollections.find(
      Array.isArray
    ) ?? []
  );
}

/* ============================================================
   VALUE HELPERS
============================================================ */

function firstNumber(
  ...values
) {
  for (const value of values) {
    const number =
      toNumber(value);

    if (number !== null) {
      return number;
    }
  }

  return null;
}

function toNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getNumericValue(
  object,
  fields
) {
  if (!object) {
    return null;
  }

  for (const field of fields) {
    const value =
      toNumber(object?.[field]);

    if (value !== null) {
      return value;
    }
  }

  return null;
}

function getTextValue(
  object,
  fields
) {
  if (!object) {
    return null;
  }

  for (const field of fields) {
    const value =
      object?.[field];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim()
    ) {
      return String(value);
    }
  }

  return null;
}

function getReadinessValue(
  readiness
) {
  const value =
    getNumericValue(
      readiness,
      [
        "readinessScore",
        "overallReadiness",
        "score",
        "overallScore",
        "value",
      ]
    );

  return value !== null
    ? formatScore(value)
    : "—";
}

function formatScore(
  value
) {
  const number =
    toNumber(value);

  if (number === null) {
    return "—";
  }

  return String(
    Math.round(number)
  );
}

function clampScore(
  value
) {
  const number =
    toNumber(value);

  if (number === null) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, number)
  );
}

function formatCount(
  value
) {
  const number =
    toNumber(value);

  if (number === null) {
    return "0";
  }

  return String(
    Math.max(
      0,
      Math.round(number)
    )
  );
}

function getApiErrorMessage(
  error,
  fallback
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default SkillIntelligencePage;