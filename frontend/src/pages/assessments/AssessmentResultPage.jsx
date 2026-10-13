import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Target,
  Trophy,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAssessment,
  useAssessmentResult,
} from "./useAssessment";

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return "Not specified";
  }

  return String(difficulty)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /^\w/,
      (character) =>
        character.toUpperCase()
    );
}

function formatScore(score) {
  if (
    score === undefined ||
    score === null ||
    score === ""
  ) {
    return "—";
  }

  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return "—";
  }

  return Math.round(numericScore);
}

function getPerformanceLabel(score) {
  if (
    score === undefined ||
    score === null ||
    score === ""
  ) {
    return "Result unavailable";
  }

  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return "Result unavailable";
  }

  if (numericScore >= 80) {
    return "Strong performance";
  }

  if (numericScore >= 60) {
    return "Good foundation";
  }

  if (numericScore >= 40) {
    return "Developing";
  }

  return "Needs more practice";
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-5 w-40 animate-pulse rounded bg-white/[0.06]" />

      <div className="rounded-2xl border border-white/5 bg-[#080a08] p-8 text-center">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-white/[0.06]" />

        <div className="mx-auto mt-5 h-9 w-48 animate-pulse rounded bg-white/[0.06]" />

        <div className="mx-auto mt-3 h-4 w-64 animate-pulse rounded bg-white/[0.04]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

/* ============================================================
   ERROR STATE
============================================================ */

function ErrorState({
  onRetry,
  onBack,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <ClipboardCheck
          size={21}
          className="text-[#95d600]"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#f4f6f3]">
        Unable to load assessment result
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        We couldn't retrieve the result for this
        assessment attempt.
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105"
        >
          Try again
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
        >
          <ArrowLeft size={15} />
          Back to Assessments
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   RESULT STAT
============================================================ */

function ResultStat({
  icon: Icon,
  label,
  value,
  suffix,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <Icon
          size={18}
          className="text-[#95d600]"
        />
      </div>

      <p className="mt-4 text-xs text-white/35">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-[#f4f6f3]">
          {value}
        </span>

        {suffix && (
          <span className="text-xs text-white/30">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AssessmentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    assessmentId,
    attemptId,
  } = useParams();

  /* ==========================================================
     ASSESSMENT RESULT
  ========================================================== */

  const {
    data: result,
    isLoading: resultLoading,
    error: resultError,
    refetch: refetchResult,
  } = useAssessmentResult(
    assessmentId,
    attemptId
  );

  /* ==========================================================
     ASSESSMENT DETAIL
     
     IMPORTANT:
     
     AssessmentResultResponse contains:
       assessmentId
       technologyName
       difficulty
       score
       ...
     
     It does NOT contain technologyId.
     
     AssessmentDetailResponse DOES contain:
       technologyId
     
     Therefore we load the assessment detail so that
     "View Skill Intelligence" can navigate using the
     correct technology ID.
  ========================================================== */

  const {
    data: assessment,
    isLoading: assessmentLoading,
    error: assessmentError,
    refetch: refetchAssessment,
  } = useAssessment(
    assessmentId
  );

  /* ==========================================================
     NAVIGATION STATE FALLBACK
     
     AssessmentAttemptPage passes the freshly created
     result through navigation state.
     
     We still prefer the backend result whenever available.
  ========================================================== */

  const navigationResult =
    location.state?.result ?? null;

  const displayResult =
    result ?? navigationResult;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    resultLoading &&
    !displayResult
  ) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  /* ==========================================================
     RESULT ERROR
  ========================================================== */

  if (
    resultError &&
    !displayResult
  ) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <ErrorState
            onRetry={() => {
              refetchResult();
              refetchAssessment();
            }}
            onBack={() =>
              navigate("/assessments")
            }
          />
        </div>
      </div>
    );
  }

  /* ==========================================================
     NO RESULT
  ========================================================== */

  if (!displayResult) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <ErrorState
            onRetry={() => {
              refetchResult();
              refetchAssessment();
            }}
            onBack={() =>
              navigate("/assessments")
            }
          />
        </div>
      </div>
    );
  }

  /* ==========================================================
     RESULT DATA
  ========================================================== */

  const score =
    displayResult.score;

  const correctAnswers =
    displayResult.correctAnswers;

  const totalQuestions =
    displayResult.totalQuestions;

  const answeredQuestions =
    displayResult.answeredQuestions;

  const completionPercentage =
    totalQuestions > 0 &&
    answeredQuestions !== null &&
    answeredQuestions !== undefined
      ? Math.round(
          (answeredQuestions /
            totalQuestions) *
            100
        )
      : null;

  /* ==========================================================
     CORRECT TECHNOLOGY ID
     
     This is the critical fix.
     
     DO NOT use:
       displayResult.assessmentId
     
     because that is an assessment ID.
     
     Use:
       assessment.technologyId
  ========================================================== */

  const technologyId =
    assessment?.technologyId ?? null;

  const isSkillNavigationLoading =
    assessmentLoading &&
    !technologyId;

  const skillNavigationError =
    assessmentError &&
    !technologyId;

  /* ==========================================================
     VIEW SKILL INTELLIGENCE
  ========================================================== */

  function handleViewSkillIntelligence() {
    if (!technologyId) {
      return;
    }

    navigate(
      `/skills/${technologyId}`
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/assessments")
          }
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Assessments
        </button>

        {/* ==================================================
            RESULT HERO
        ================================================== */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#080a08]">
          <div className="p-6 text-center sm:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#95d600]/20 bg-[#95d600]/[0.06]">
              <Trophy
                size={28}
                className="text-[#95d600]"
              />
            </div>

            <p className="mt-5 text-sm text-[#95d600]">
              Assessment completed
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {displayResult.technologyName ??
                "Assessment Result"}
            </h1>

            <p className="mt-2 text-sm text-white/40">
              {formatDifficulty(
                displayResult.difficulty
              )}
            </p>

            {/* SCORE */}

            <div className="mt-8">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-semibold tracking-tight text-[#f4f6f3] sm:text-7xl">
                  {formatScore(score)}
                </span>

                {score !== null &&
                  score !== undefined && (
                    <span className="text-sm text-white/30">
                      / 100
                    </span>
                  )}
              </div>

              <p className="mt-2 text-sm text-white/45">
                {getPerformanceLabel(
                  score
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
            STATS
        ================================================== */}

        <section className="mt-5 grid gap-4 sm:grid-cols-3">

          <ResultStat
            icon={CheckCircle2}
            label="Correct answers"
            value={
              correctAnswers ??
              "—"
            }
            suffix={
              totalQuestions !==
                null &&
              totalQuestions !==
                undefined
                ? `of ${totalQuestions}`
                : null
            }
          />

          <ResultStat
            icon={ClipboardCheck}
            label="Answered"
            value={
              answeredQuestions ??
              "—"
            }
            suffix={
              totalQuestions !==
                null &&
              totalQuestions !==
                undefined
                ? `of ${totalQuestions}`
                : null
            }
          />

          <ResultStat
            icon={Target}
            label="Completion"
            value={
              completionPercentage !==
              null
                ? completionPercentage
                : "—"
            }
            suffix={
              completionPercentage !==
              null
                ? "%"
                : null
            }
          />

        </section>

        {/* ==================================================
            PERFORMANCE BREAKDOWN
        ================================================== */}

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#080a08] p-5 sm:p-6">

          <h2 className="text-base font-semibold text-[#f4f6f3]">
            Performance overview
          </h2>

          <div className="mt-5">

            <div className="flex items-center justify-between text-xs">

              <span className="text-white/35">
                Correct answers
              </span>

              <span className="text-white/50">
                {correctAnswers ??
                  "—"}
                {" "}
                /
                {" "}
                {totalQuestions ??
                  "—"}
              </span>

            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">

              {score !== null &&
                score !== undefined && (
                  <div
                    className="h-full rounded-full bg-[#95d600]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number(score) ||
                            0
                        )
                      )}%`,
                    }}
                  />
                )}

            </div>

          </div>

          <div className="mt-6 grid gap-4 border-t border-white/5 pt-5 sm:grid-cols-2">

            <div>
              <p className="text-xs text-white/30">
                Started
              </p>

              <p className="mt-1.5 text-sm text-white/60">
                {formatDate(
                  displayResult.startedAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/30">
                Completed
              </p>

              <p className="mt-1.5 text-sm text-white/60">
                {formatDate(
                  displayResult.completedAt
                )}
              </p>
            </div>

          </div>

        </section>

        {/* ==================================================
            NEXT ACTIONS
        ================================================== */}

        <section className="mt-5 rounded-2xl border border-[#95d600]/15 bg-[#95d600]/[0.03] p-5 sm:p-6">

          <div>

            <h2 className="text-base font-semibold text-[#f4f6f3]">
              What next?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Your assessment result is now part of your
              SkillNexus skill intelligence. Review your
              technology profile or continue preparing
              with Career Coach.
            </p>

          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

            {/* ==================================================
                CORRECT SKILL NAVIGATION
            ================================================== */}

            <button
              type="button"
              onClick={
                handleViewSkillIntelligence
              }
              disabled={
                isSkillNavigationLoading ||
                skillNavigationError ||
                !technologyId
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSkillNavigationLoading
                ? "Loading skill..."
                : skillNavigationError
                  ? "Skill unavailable"
                  : "View Skill Intelligence"}

              {!isSkillNavigationLoading &&
                !skillNavigationError && (
                  <ArrowRight
                    size={15}
                  />
                )}
            </button>

            {/* ==================================================
                CAREER COACH
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/career-coach"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Open Career Coach
              <ArrowRight size={15} />
            </button>

          </div>

          {/* ==================================================
              SKILL LOAD ERROR
          ================================================== */}

          {skillNavigationError && (
            <p className="mt-3 text-xs text-white/30">
              Technology information could not be
              loaded. You can still continue to Career
              Coach or return to Assessments.
            </p>
          )}

        </section>

        {/* ==================================================
            RETURN
        ================================================== */}

        <div className="mt-6 text-center">

          <button
            type="button"
            onClick={() =>
              navigate("/assessments")
            }
            className="text-sm text-white/35 transition hover:text-white"
          >
            Return to all assessments
          </button>

        </div>

      </div>
    </div>
  );
}