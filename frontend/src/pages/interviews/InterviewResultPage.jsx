import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  CircleAlert,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Target,
  Trophy,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useInterview,
  useInterviewQuestions,
  useInterviewResult,
} from "./useInterview";

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return "Unknown";
  }

  return String(difficulty)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getScoreLabel(score) {
  if (score == null) {
    return "Not available";
  }

  if (score >= 80) {
    return "Strong performance";
  }

  if (score >= 60) {
    return "Solid foundation";
  }

  if (score >= 40) {
    return "Needs improvement";
  }

  return "Keep practicing";
}

function getScoreBarWidth(score) {
  if (score == null) {
    return "0%";
  }

  const normalizedScore = Math.min(
    100,
    Math.max(0, Number(score))
  );

  return `${normalizedScore}%`;
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function InterviewResultPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const {
    data: interview,
    isLoading: isInterviewLoading,
  } = useInterview(interviewId);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
  } = useInterviewQuestions(interviewId);

  const {
    data: result,
    isLoading: isResultLoading,
    isError: isResultError,
    error: resultError,
    refetch: refetchResult,
  } = useInterviewResult(interviewId);

  const isLoading =
    isInterviewLoading ||
    isQuestionsLoading ||
    isResultLoading;

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading interview result...
          </div>
        </div>
      </div>
    );
  }

  if (isResultError || !result) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-white/10 bg-[#111412] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10">
              <CircleAlert
                size={22}
                className="text-red-300"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Unable to load interview result
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
              {getApiErrorMessage(
                resultError,
                "The interview result could not be loaded."
              )}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => refetchResult()}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.07]"
              >
                Try again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/interviews")
                }
                className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Back to interviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questionList = Array.isArray(questions)
    ? [...questions].sort(
        (firstQuestion, secondQuestion) =>
          Number(firstQuestion?.questionNumber ?? 0) -
          Number(secondQuestion?.questionNumber ?? 0)
      )
    : [];

  const evaluations = Array.isArray(result.evaluations)
    ? result.evaluations
    : [];

  const questionMap = new Map(
    questionList
      .filter((question) => question?.id != null)
      .map((question) => [
        question.id,
        question,
      ])
  );

  const score =
    result.score != null
      ? Number(result.score)
      : null;

  const totalQuestions =
    result.totalQuestions != null
      ? Number(result.totalQuestions)
      : 0;

  const answeredQuestions =
    result.answeredQuestions != null
      ? Number(result.answeredQuestions)
      : 0;

  const answeredPercentage =
    totalQuestions > 0
      ? Math.round(
          (answeredQuestions / totalQuestions) * 100
        )
      : 0;

  return (
    <div className="min-h-full bg-[#0b0d0c] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-8">
          <header>
            <button
              type="button"
              onClick={() =>
                navigate("/interviews")
              }
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to interviews
            </button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Interview result
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {result.technologyName}
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                  {formatDifficulty(result.difficulty)}
                  {" · "}
                  Completed{" "}
                  {formatDate(result.completedAt)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/interviews")
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  All interviews
                </button>

                {interview?.technologyId && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/skills/${interview.technologyId}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  >
                    View skill
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </header>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-3xl border border-white/10 bg-[#111412] p-7 sm:p-8">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
                <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5">
                  <Trophy
                    size={20}
                    className="mb-2 text-emerald-300"
                  />

                  <span className="text-4xl font-semibold tracking-tight">
                    {score ?? "—"}
                  </span>

                  <span className="mt-1 text-xs text-zinc-500">
                    out of 100
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Overall performance
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                    {getScoreLabel(score)}
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                    Your interview score is based on the
                    evaluations recorded for this completed
                    interview.
                  </p>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                      <span>Overall score</span>

                      <span>
                        {score != null
                          ? `${score}%`
                          : "—"}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{
                          width:
                            getScoreBarWidth(score),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#111412] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <ClipboardCheck
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <p className="mt-4 text-xs text-zinc-500">
                  Questions
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {totalQuestions}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111412] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <p className="mt-4 text-xs text-zinc-500">
                  Answered
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {answeredQuestions}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111412] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <Target
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <p className="mt-4 text-xs text-zinc-500">
                  Completion
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {answeredPercentage}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111412] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <MessageSquareText
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <p className="mt-4 text-xs text-zinc-500">
                  Evaluations
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {evaluations.length}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#111412] p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                AI evaluation
              </p>

              <h2 className="text-xl font-semibold tracking-tight">
                Question-by-question feedback
              </h2>

              <p className="text-sm leading-6 text-zinc-400">
                Review how each submitted answer was
                evaluated and identify the areas to improve.
              </p>
            </div>

            {evaluations.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                <MessageSquareText
                  size={26}
                  className="mx-auto text-zinc-600"
                />

                <p className="mt-4 text-sm font-medium text-zinc-300">
                  No evaluation details available
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  The interview result does not contain
                  individual evaluation records.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {evaluations.map(
                  (evaluation, index) => {
                    const question =
                      questionMap.get(
                        evaluation?.questionId
                      );

                    const evaluationScore =
                      evaluation?.score != null
                        ? Number(evaluation.score)
                        : null;

                    const strengths =
                      Array.isArray(
                        evaluation?.strengths
                      )
                        ? evaluation.strengths
                        : [];

                    const improvements =
                      Array.isArray(
                        evaluation?.improvements
                      )
                        ? evaluation.improvements
                        : [];

                    return (
                      <article
                        key={
                          evaluation?.questionId ??
                          `evaluation-${index}`
                        }
                        className="rounded-2xl border border-white/10 bg-[#0d100e] p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-zinc-500">
                                Question{" "}
                                {question?.questionNumber ??
                                  index + 1}
                              </span>

                              <h3 className="mt-4 text-base font-semibold leading-7 text-zinc-100 sm:text-lg">
                                {question?.questionText ||
                                  "Question text unavailable"}
                              </h3>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
                              <Target
                                size={16}
                                className="text-emerald-300"
                              />

                              <span className="text-sm font-semibold text-emerald-200">
                                {evaluationScore ??
                                  "—"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                              <span>
                                Answer score
                              </span>

                              <span>
                                {evaluationScore !=
                                null
                                  ? `${evaluationScore}%`
                                  : "—"}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{
                                  width:
                                    getScoreBarWidth(
                                      evaluationScore
                                    ),
                                }}
                              />
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div className="flex items-center gap-2">
                              <MessageSquareText
                                size={16}
                                className="text-zinc-400"
                              />

                              <h4 className="text-sm font-medium text-zinc-200">
                                Feedback
                              </h4>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-zinc-400">
                              {evaluation?.feedback ||
                                "No feedback available."}
                            </p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-300"
                                />

                                <h4 className="text-sm font-medium text-zinc-200">
                                  Strengths
                                </h4>
                              </div>

                              {strengths.length > 0 ? (
                                <ul className="mt-3 space-y-2">
                                  {strengths.map(
                                    (
                                      strength,
                                      strengthIndex
                                    ) => (
                                      <li
                                        key={`${evaluation?.questionId ?? index}-strength-${strengthIndex}`}
                                        className="flex gap-2 text-sm leading-6 text-zinc-400"
                                      >
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                                        <span>
                                          {strength}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="mt-3 text-sm text-zinc-600">
                                  No strengths recorded.
                                </p>
                              )}
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                              <div className="flex items-center gap-2">
                                <Lightbulb
                                  size={16}
                                  className="text-amber-300"
                                />

                                <h4 className="text-sm font-medium text-zinc-200">
                                  Improvements
                                </h4>
                              </div>

                              {improvements.length > 0 ? (
                                <ul className="mt-3 space-y-2">
                                  {improvements.map(
                                    (
                                      improvement,
                                      improvementIndex
                                    ) => (
                                      <li
                                        key={`${evaluation?.questionId ?? index}-improvement-${improvementIndex}`}
                                        className="flex gap-2 text-sm leading-6 text-zinc-400"
                                      >
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                                        <span>
                                          {
                                            improvement
                                          }
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="mt-3 text-sm text-zinc-600">
                                  No improvements recorded.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111412] p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  Continue your preparation
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Use your interview feedback to identify
                  areas that need more practice.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/career-coach")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Open Career Coach
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/interviews")
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  Back to interviews
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-zinc-600">
            <span>
              Started: {formatDate(result.startedAt)}
            </span>

            <span>
              Completed:{" "}
              {formatDate(result.completedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewResultPage;