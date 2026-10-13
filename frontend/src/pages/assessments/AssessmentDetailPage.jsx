import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAssessment,
  useStartAssessment,
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

function formatDifficulty(
  difficulty
) {
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

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /^\w/,
      (character) =>
        character.toUpperCase()
    );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const isReady =
    status === "READY";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        isReady
          ? "border-[#95d600]/20 bg-[#95d600]/[0.06] text-[#95d600]"
          : "border-white/10 bg-white/[0.03] text-white/45"
      }`}
    >
      {isReady ? (
        <CheckCircle2 size={13} />
      ) : (
        <Clock3 size={13} />
      )}

      {formatStatus(status)}
    </span>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-5 w-44 animate-pulse rounded bg-white/[0.06]" />

      <div className="rounded-2xl border border-white/5 bg-[#080a08] p-6 sm:p-8">
        <div className="h-5 w-32 animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-5 h-9 w-72 animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.04]" />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ERROR
============================================================ */

function ErrorState({ onRetry, onBack }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <RefreshCw
          size={20}
          className="text-[#95d600]"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#f4f6f3]">
        Unable to load assessment
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        We couldn't retrieve this assessment.
        Please try again or return to your
        assessments.
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105"
        >
          <RefreshCw size={15} />
          Try again
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AssessmentDetailPage() {
  const navigate = useNavigate();

  const { assessmentId } =
    useParams();

  const {
    data: assessment,
    isLoading,
    error,
    refetch,
  } = useAssessment(
    assessmentId
  );

  const startAssessment =
    useStartAssessment();

  /* ==========================================================
     START ATTEMPT
  ========================================================== */

  const handleStartAssessment =
    async () => {
      if (!assessmentId) {
        return;
      }

      try {
        const attempt =
          await startAssessment.mutateAsync(
            Number(assessmentId)
          );

        if (!attempt?.id) {
          return;
        }

        navigate(
          `/assessments/${assessmentId}/attempt/${attempt.id}`
        );
      } catch {
        // Mutation error is rendered below.
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <ErrorState
            onRetry={refetch}
            onBack={() =>
              navigate("/assessments")
            }
          />
        </div>
      </div>
    );
  }

  const questions =
    Array.isArray(
      assessment.questions
    )
      ? assessment.questions
      : [];

  const isReady =
    assessment.status === "READY";

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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
            HEADER
        ================================================== */}

        <header className="mt-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#95d600]/20 bg-[#95d600]/[0.06] px-3 py-1 text-xs font-medium text-[#95d600]">
                  <BookOpen size={13} />
                  Assessment
                </span>

                <StatusBadge
                  status={
                    assessment.status
                  }
                />
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {assessment.technologyName ??
                  "Technology Assessment"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Evaluate your knowledge with a focused
                technical assessment for this technology.
              </p>
            </div>

            {/* START BUTTON */}
            <button
              type="button"
              disabled={
                !isReady ||
                startAssessment.isPending
              }
              onClick={
                handleStartAssessment
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#95d600] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {startAssessment.isPending ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Starting...
                </>
              ) : (
                <>
                  Start Assessment
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </header>

        {/* ==================================================
            START ERROR
        ================================================== */}

        {startAssessment.isError && (
          <div className="mt-5 rounded-xl border border-white/10 bg-[#080a08] px-4 py-3 text-sm text-white/55">
            <span className="text-[#95d600]">
              Unable to start the assessment.
            </span>{" "}
            Please try again.
          </div>
        )}

        {/* ==================================================
            ASSESSMENT OVERVIEW
        ================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#080a08] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <FileQuestion
                size={18}
                className="text-[#95d600]"
              />
            </div>

            <p className="mt-4 text-xs text-white/35">
              Questions
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#f4f6f3]">
              {assessment.questionCount ??
                questions.length ??
                "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#080a08] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <BookOpen
                size={18}
                className="text-[#95d600]"
              />
            </div>

            <p className="mt-4 text-xs text-white/35">
              Difficulty
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#f4f6f3]">
              {formatDifficulty(
                assessment.difficulty
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#080a08] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Clock3
                size={18}
                className="text-[#95d600]"
              />
            </div>

            <p className="mt-4 text-xs text-white/35">
              Created
            </p>

            <p className="mt-1 text-sm font-medium text-[#f4f6f3]">
              {formatDate(
                assessment.createdAt
              )}
            </p>
          </div>
        </section>

        {/* ==================================================
            QUESTION PREVIEW
        ================================================== */}

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#080a08] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-[#f4f6f3]">
                Assessment structure
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Preview of the questions included in
                this assessment.
              </p>
            </div>

            <span className="text-xs text-white/30">
              {questions.length} question
              {questions.length === 1
                ? ""
                : "s"} available
            </span>
          </div>

          {questions.length > 0 ? (
            <div className="mt-5 space-y-3">
              {questions.map(
                (question, index) => (
                  <div
                    key={
                      question.id ??
                      index
                    }
                    className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-xs font-medium text-white/45">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm leading-6 text-white/70">
                        {question.questionText ??
                          "Question"}
                      </p>

                      {Array.isArray(
                        question.options
                      ) &&
                        question.options
                          .length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {question.options.map(
                              (
                                option,
                                optionIndex
                              ) => (
                                <span
                                  key={
                                    optionIndex
                                  }
                                  className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-xs text-white/35"
                                >
                                  Option{" "}
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-8 text-center">
              <p className="text-sm text-white/40">
                No questions are available for preview.
              </p>
            </div>
          )}
        </section>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <section className="mt-5 rounded-2xl border border-[#95d600]/10 bg-[#95d600]/[0.025] p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#95d600]/15 bg-[#95d600]/[0.05]">
              <CheckCircle2
                size={17}
                className="text-[#95d600]"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#f4f6f3]">
                Ready when you are
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/45">
                Your answers will be evaluated when you
                submit the assessment. Your final result
                will contribute to your skill intelligence.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}