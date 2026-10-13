import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useSkillDetails } from "./useSkillIntelligence";

/* ============================================================
   HELPERS
============================================================ */

function getValue(source, keys, fallback = null) {
  if (!source || typeof source !== "object") {
    return fallback;
  }

  for (const key of keys) {
    const value = source[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
}

function formatScore(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "—";
  }

  return `${Math.round(numericValue)}`;
}

function getScoreLabel(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Not available";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "Not available";
  }

  if (numericValue >= 80) {
    return "Strong";
  }

  if (numericValue >= 60) {
    return "Developing";
  }

  if (numericValue >= 40) {
    return "Needs improvement";
  }

  return "Needs attention";
}

/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Icon
            size={19}
            className="text-[#95d600]"
          />
        </div>

        <span className="text-xs font-medium text-white/40">
          {getScoreLabel(value)}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm text-white/50">
          {label}
        </p>

        <div className="mt-1 flex items-end gap-1">
          <span className="text-3xl font-semibold tracking-tight text-[#f4f6f3]">
            {formatScore(value)}
          </span>

          {value !== undefined &&
            value !== null &&
            value !== "" && (
              <span className="mb-1 text-sm text-white/35">
                / 100
              </span>
            )}
        </div>

        {description && (
          <p className="mt-2 text-xs leading-5 text-white/35">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PROGRESS BAR
============================================================ */

function ProgressBar({ value }) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return (
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]" />
    );
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return (
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]" />
    );
  }

  const percentage = Math.min(
    100,
    Math.max(0, numericValue)
  );

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full bg-[#95d600] transition-all duration-500"
        style={{
          width: `${percentage}%`,
        }}
      />
    </div>
  );
}

/* ============================================================
   DETAIL SECTION
============================================================ */

function DetailSection({
  title,
  children,
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#080a08] p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[#f4f6f3]">
        {title}
      </h2>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-6 w-40 animate-pulse rounded bg-white/[0.06]" />

      <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

/* ============================================================
   ERROR STATE
============================================================ */

function ErrorState({ onBack }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <Target
          size={20}
          className="text-[#95d600]"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#f4f6f3]">
        Unable to load skill details
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
        We could not retrieve the information for
        this technology. Please go back and try again.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
      >
        <ArrowLeft size={16} />
        Back to skills
      </button>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function SkillDetailPage() {
  const navigate = useNavigate();
  const { technologyId } = useParams();

  const {
    data,
    isLoading,
    error,
  } = useSkillDetails(technologyId);

  const skill = data?.skill ?? null;
  const progress = data?.progress ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050605] px-4 py-6 text-[#f4f6f3] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050605] px-4 py-6 text-[#f4f6f3] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ErrorState
            onBack={() => navigate("/skills")}
          />
        </div>
      </div>
    );
  }

  if (!skill && !progress) {
    return (
      <div className="min-h-screen bg-[#050605] px-4 py-6 text-[#f4f6f3] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ErrorState
            onBack={() => navigate("/skills")}
          />
        </div>
      </div>
    );
  }

  /* ==========================================================
     NORMALIZE BACKEND DATA
  ========================================================== */

  const technologyName =
    getValue(
      progress,
      [
        "technologyName",
        "name",
        "technology",
      ]
    ) ??
    getValue(
      skill,
      [
        "technologyName",
        "name",
        "technology",
      ]
    ) ??
    "Technology";

  const category = getValue(
    skill,
    [
      "category",
      "technologyCategory",
      "type",
    ]
  );

  const description = getValue(
    skill,
    [
      "description",
      "summary",
      "technologyDescription",
      "details",
    ]
  );

  const level = getValue(
    skill,
    [
      "level",
      "skillLevel",
      "proficiencyLevel",
    ]
  );

  const overallScore = getValue(
    progress,
    [
      "overallScore",
      "score",
    ]
  );

  const assessmentScore = getValue(
    progress,
    [
      "assessmentScore",
    ]
  );

  const interviewScore = getValue(
    progress,
    [
      "interviewScore",
    ]
  );

  const progressScore = getValue(
    progress,
    [
      "progress",
      "progressScore",
      "completionPercentage",
    ]
  );

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate("/skills")}
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Skill Intelligence
        </button>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mt-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#95d600]/20 bg-[#95d600]/[0.06] px-3 py-1 text-xs font-medium text-[#95d600]">
                  <Brain size={13} />
                  Skill Intelligence
                </span>

                {category && (
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/40">
                    {category}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {technologyName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Understand your current capability,
                assessment performance, and interview
                readiness for this technology.
              </p>
            </div>

            {level && (
              <div className="rounded-xl border border-white/10 bg-[#080a08] px-4 py-3">
                <p className="text-xs text-white/35">
                  Current level
                </p>

                <p className="mt-1 text-sm font-medium text-[#f4f6f3]">
                  {level}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* ====================================================
            OVERALL SCORE
        ==================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#080a08]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm text-white/45">
                  <TrendingUp
                    size={16}
                    className="text-[#95d600]"
                  />
                  Overall skill score
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-[#f4f6f3]">
                    {formatScore(overallScore)}
                  </span>

                  {overallScore !== undefined &&
                    overallScore !== null &&
                    overallScore !== "" && (
                      <span className="mb-2 text-sm text-white/35">
                        / 100
                      </span>
                    )}
                </div>

                <p className="mt-2 text-sm text-white/40">
                  {getScoreLabel(overallScore)}
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-white/35">
                    Skill progress
                  </span>

                  <span className="text-white/50">
                    {formatScore(progressScore)}
                    {progressScore !== undefined &&
                      progressScore !== null &&
                      progressScore !== "" &&
                      " / 100"}
                  </span>
                </div>

                <ProgressBar
                  value={progressScore}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SCORE BREAKDOWN
        ==================================================== */}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <ScoreCard
            icon={TrendingUp}
            label="Overall"
            value={overallScore}
            description="Combined skill intelligence score."
          />

          <ScoreCard
            icon={ClipboardCheck}
            label="Assessment"
            value={assessmentScore}
            description="Performance from completed assessments."
          />

          <ScoreCard
            icon={CheckCircle2}
            label="Interview"
            value={interviewScore}
            description="Performance from AI interview evaluations."
          />
        </section>

        {/* ====================================================
            TECHNOLOGY INFORMATION
        ==================================================== */}

        {(description || level) && (
          <div className="mt-5">
            <DetailSection title="Technology information">
              <div className="space-y-5">
                {description && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                      About this skill
                    </p>

                    <p className="mt-2 max-w-3xl text-sm leading-7 text-white/55">
                      {description}
                    </p>
                  </div>
                )}

                {level && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                      Current level
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#f4f6f3]">
                      {level}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>
          </div>
        )}

        {/* ====================================================
            NEXT ACTION
        ==================================================== */}

        <div className="mt-5 rounded-2xl border border-[#95d600]/15 bg-[#95d600]/[0.03] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Target
                  size={17}
                  className="text-[#95d600]"
                />

                <h2 className="text-sm font-semibold text-[#f4f6f3]">
                  Keep improving
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Use your assessment and interview
                performance to identify where additional
                preparation can improve your readiness.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/career-coach")
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105"
            >
              Open Career Coach
              <ArrowLeft
                size={15}
                className="rotate-180"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}