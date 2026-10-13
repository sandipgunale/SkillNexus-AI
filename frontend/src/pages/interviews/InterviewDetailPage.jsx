import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Loader2,
  Send,
  Trophy,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useInterview,
  useInterviewQuestions,
  useSubmitInterviewAnswer,
  useCompleteInterview,
} from "./useInterview";
import { useEffect, useMemo, useState } from "react";

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return "Unknown";
  }

  return String(difficulty)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function InterviewDetailPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const {
    data: interview,
    isLoading: isInterviewLoading,
    isError: isInterviewError,
    error: interviewError,
    refetch: refetchInterview,
  } = useInterview(interviewId);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    error: questionsError,
    refetch: refetchQuestions,
  } = useInterviewQuestions(interviewId);

  const submitAnswerMutation = useSubmitInterviewAnswer();
  const completeInterviewMutation = useCompleteInterview();

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answer, setAnswer] = useState("");

  const [submittedQuestionIds, setSubmittedQuestionIds] =
    useState(() => new Set());

  const [actionError, setActionError] = useState("");

  const normalizedQuestions = useMemo(() => {
    if (!Array.isArray(questions)) {
      return [];
    }

    return [...questions].sort(
      (firstQuestion, secondQuestion) =>
        Number(firstQuestion?.questionNumber ?? 0) -
        Number(secondQuestion?.questionNumber ?? 0)
    );
  }, [questions]);

  const currentQuestion =
    normalizedQuestions[currentQuestionIndex] || null;

  const isCompleted =
    String(interview?.status || "").toUpperCase() ===
    "COMPLETED";

  const isSubmittingAnswer =
    submitAnswerMutation.isPending;

  const isCompletingInterview =
    completeInterviewMutation.isPending;

  const isActionLoading =
    isSubmittingAnswer || isCompletingInterview;

  const currentQuestionAlreadySubmitted =
    currentQuestion?.id != null &&
    submittedQuestionIds.has(currentQuestion.id);

  const answeredCount = submittedQuestionIds.size;

  const totalQuestions =
    normalizedQuestions.length ||
    interview?.questionCount ||
    0;

  const progressPercentage =
    totalQuestions > 0
      ? Math.round(
          ((currentQuestionIndex + 1) / totalQuestions) *
            100
        )
      : 0;

  useEffect(() => {
    setAnswer("");
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (!interviewId) {
      return;
    }

    setCurrentQuestionIndex(0);
    setAnswer("");
    setSubmittedQuestionIds(new Set());
    setActionError("");
  }, [interviewId]);

  async function handleSubmitAnswer() {
    if (!currentQuestion?.id) {
      return false;
    }

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setActionError(
        "Please write an answer before submitting."
      );
      return false;
    }

    if (currentQuestionAlreadySubmitted) {
      return true;
    }

    setActionError("");

    try {
      await submitAnswerMutation.mutateAsync({
        interviewId,
        questionId: currentQuestion.id,
        answer: trimmedAnswer,
      });

      setSubmittedQuestionIds(
        (previousIds) => {
          const nextIds = new Set(previousIds);
          nextIds.add(currentQuestion.id);
          return nextIds;
        }
      );

      return true;
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to submit your answer. Please try again."
        )
      );

      return false;
    }
  }

  async function handleNext() {
    setActionError("");

    const answerSubmitted =
      await handleSubmitAnswer();

    if (!answerSubmitted) {
      return;
    }

    if (
      currentQuestionIndex <
      normalizedQuestions.length - 1
    ) {
      setCurrentQuestionIndex(
        (previousIndex) => previousIndex + 1
      );
    }
  }

  async function handleCompleteInterview() {
    setActionError("");

    const answerSubmitted =
      await handleSubmitAnswer();

    if (!answerSubmitted) {
      return;
    }

    try {
      const result =
        await completeInterviewMutation.mutateAsync(
          interviewId
        );

      navigate(
        `/interviews/${interviewId}/result`,
        {
          replace: true,
          state: {
            result,
          },
        }
      );
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to complete the interview. Please try again."
        )
      );
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex === 0 || isActionLoading) {
      return;
    }

    setActionError("");

    setCurrentQuestionIndex(
      (previousIndex) => previousIndex - 1
    );
  }

  function handleRetry() {
    setActionError("");

    if (isInterviewError) {
      refetchInterview();
    }

    if (isQuestionsError) {
      refetchQuestions();
    }
  }

  if (isInterviewLoading || isQuestionsLoading) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading interview...
          </div>
        </div>
      </div>
    );
  }

  if (
    isInterviewError ||
    isQuestionsError ||
    !interview
  ) {
    const errorMessage = isInterviewError
      ? getApiErrorMessage(
          interviewError,
          "Unable to load this interview."
        )
      : isQuestionsError
        ? getApiErrorMessage(
            questionsError,
            "Unable to load interview questions."
          )
        : "Interview details are unavailable.";

    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-white/10 bg-[#111412] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10">
              <CircleAlert
                size={22}
                className="text-red-300"
              />
            </div>

            <h2 className="text-lg font-semibold">
              Unable to load interview
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {errorMessage}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
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

  if (isCompleted) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate("/interviews")
            }
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to interviews
          </button>

          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#111412] p-8 text-center shadow-2xl shadow-black/20 sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
              <Trophy
                size={28}
                className="text-emerald-300"
              />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Interview completed
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {interview.technologyName} interview
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-400">
              This interview has already been completed.
              Review your result to understand your
              performance and evaluation.
            </p>

            {interview.score != null && (
              <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <ClipboardCheck
                  size={20}
                  className="text-emerald-300"
                />

                <div className="text-left">
                  <p className="text-xs text-zinc-500">
                    Score
                  </p>

                  <p className="mt-0.5 text-xl font-semibold">
                    {interview.score}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/interviews/${interviewId}/result`
                )
              }
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              View result
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (normalizedQuestions.length === 0) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate("/interviews")
            }
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to interviews
          </button>

          <div className="rounded-2xl border border-white/10 bg-[#111412] p-8 text-center">
            <ClipboardCheck
              size={28}
              className="mx-auto text-zinc-500"
            />

            <h2 className="mt-4 text-lg font-semibold">
              No interview questions available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
              The interview was created, but there are
              currently no questions available to answer.
            </p>

            <button
              type="button"
              onClick={refetchQuestions}
              className="mt-6 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Refresh questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLastQuestion =
    currentQuestionIndex ===
    normalizedQuestions.length - 1;

  return (
    <div className="min-h-full bg-[#0b0d0c] text-white">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() =>
                  navigate("/interviews")
                }
                className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to interviews
              </button>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Technical interview
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {interview.technologyName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <span>
                  {formatDifficulty(
                    interview.difficulty
                  )}
                </span>

                <span className="text-zinc-700">
                  •
                </span>

                <span>
                  {totalQuestions} questions
                </span>

                <span className="text-zinc-700">
                  •
                </span>

                <span>
                  {formatStatus(interview.status)}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#111412] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                <ClipboardCheck
                  size={18}
                  className="text-emerald-300"
                />
              </div>

              <div>
                <p className="text-xs text-zinc-500">
                  Answered
                </p>

                <p className="text-sm font-semibold text-zinc-200">
                  {answeredCount} / {totalQuestions}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>
                Question {currentQuestionIndex + 1} of{" "}
                {totalQuestions}
              </span>

              <span>{progressPercentage}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <main className="rounded-3xl border border-white/10 bg-[#111412] p-6 shadow-2xl shadow-black/10 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-zinc-400">
                    Question{" "}
                    {currentQuestion.questionNumber}
                  </span>

                  <h2 className="mt-5 text-xl font-semibold leading-8 tracking-tight text-zinc-100 sm:text-2xl">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {currentQuestionAlreadySubmitted && (
                  <CheckCircle2
                    size={21}
                    className="mt-1 shrink-0 text-emerald-300"
                  />
                )}
              </div>

              <div className="mt-8">
                <label
                  htmlFor="interview-answer"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Your answer
                </label>

                <textarea
                  id="interview-answer"
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  disabled={
                    currentQuestionAlreadySubmitted ||
                    isActionLoading
                  }
                  rows={10}
                  placeholder="Explain your answer clearly. Include concepts, reasoning, examples, or practical details where relevant."
                  className="w-full resize-y rounded-2xl border border-white/10 bg-[#0c0f0d] px-4 py-4 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-2 flex justify-between text-xs text-zinc-600">
                  <span>
                    Take your time and answer as you
                    would in a technical interview.
                  </span>

                  <span>
                    {answer.length} characters
                  </span>
                </div>
              </div>

              {actionError && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
                  <CircleAlert
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{actionError}</span>
                </div>
              )}

              {currentQuestionAlreadySubmitted && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
                  <CheckCircle2 size={17} />
                  Your answer has been submitted.
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={
                    currentQuestionIndex === 0 ||
                    isActionLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>

                {!isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      isActionLoading ||
                      currentQuestionAlreadySubmitted
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingAnswer ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit & continue
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteInterview}
                    disabled={
                      isActionLoading ||
                      currentQuestionAlreadySubmitted
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCompletingInterview ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Submit & complete
                      </>
                    )}
                  </button>
                )}
              </div>
            </main>

            <aside className="h-fit rounded-2xl border border-white/10 bg-[#111412] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Interview progress
              </p>

              <div className="mt-5 space-y-2">
                {normalizedQuestions.map(
                  (question, index) => {
                    const isCurrent =
                      index === currentQuestionIndex;

                    const isSubmitted =
                      submittedQuestionIds.has(
                        question.id
                      );

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => {
                          if (isActionLoading) {
                            return;
                          }

                          setActionError("");
                          setCurrentQuestionIndex(index);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                          isCurrent
                            ? "border-emerald-400/30 bg-emerald-400/5"
                            : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                            isSubmitted
                              ? "bg-emerald-400/10 text-emerald-300"
                              : isCurrent
                                ? "bg-white/10 text-white"
                                : "bg-white/[0.04] text-zinc-500"
                          }`}
                        >
                          {isSubmitted ? (
                            <CheckCircle2
                              size={15}
                            />
                          ) : (
                            index + 1
                          )}
                        </span>

                        <span
                          className={`truncate text-sm ${
                            isCurrent
                              ? "font-medium text-zinc-100"
                              : "text-zinc-500"
                          }`}
                        >
                          Question {index + 1}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-xs leading-5 text-zinc-600">
                  Answers are submitted individually.
                  Once an answer is submitted, it cannot
                  be changed through this interview flow.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewDetailPage;