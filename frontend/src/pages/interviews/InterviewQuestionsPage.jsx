import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useCompleteInterview,
  useInterview,
  useInterviewQuestions,
  useSubmitInterviewAnswer,
} from "./useInterview";

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function InterviewQuestionsPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const {
    data: interview,
    isLoading: isInterviewLoading,
    isError: isInterviewError,
    error: interviewError,
  } = useInterview(interviewId);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    error: questionsError,
    refetch: refetchQuestions,
  } = useInterviewQuestions(interviewId);

  const submitAnswerMutation =
    useSubmitInterviewAnswer();

  const completeInterviewMutation =
    useCompleteInterview();

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answer, setAnswer] = useState("");

  const [submittedAnswers, setSubmittedAnswers] =
    useState({});

  const [actionError, setActionError] = useState("");

  const normalizedQuestions = useMemo(() => {
    if (!Array.isArray(questions)) {
      return [];
    }

    return [...questions].sort(
      (a, b) =>
        Number(a?.questionNumber ?? 0) -
        Number(b?.questionNumber ?? 0)
    );
  }, [questions]);

  const currentQuestion =
    normalizedQuestions[currentQuestionIndex];

  const totalQuestions =
    normalizedQuestions.length;

  const currentQuestionNumber =
    currentQuestionIndex + 1;

  const isCurrentQuestionSubmitted =
    currentQuestion?.id !== undefined &&
    currentQuestion?.id !== null &&
    Boolean(
      submittedAnswers[currentQuestion.id]
    );

  const submittedCount =
    Object.keys(submittedAnswers).length;

  const progressPercentage =
    totalQuestions > 0
      ? Math.round(
          (submittedCount / totalQuestions) * 100
        )
      : 0;

  const isSubmitting =
    submitAnswerMutation.isPending;

  const isCompleting =
    completeInterviewMutation.isPending;

  const isBusy =
    isSubmitting || isCompleting;

  const isLastQuestion =
    currentQuestionIndex ===
    totalQuestions - 1;

  const handleSubmitAnswer = async () => {
    setActionError("");

    if (!currentQuestion?.id) {
      setActionError(
        "The current interview question is unavailable."
      );
      return false;
    }

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setActionError(
        "Please enter an answer before submitting."
      );
      return false;
    }

    try {
      await submitAnswerMutation.mutateAsync({
        interviewId,
        questionId: currentQuestion.id,
        answer: trimmedAnswer,
      });

      setSubmittedAnswers((previous) => ({
        ...previous,
        [currentQuestion.id]: trimmedAnswer,
      }));

      return true;
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to submit your answer."
        )
      );

      return false;
    }
  };

  const handleNext = async () => {
    setActionError("");

    if (!isCurrentQuestionSubmitted) {
      const submitted =
        await handleSubmitAnswer();

      if (!submitted) {
        return;
      }
    }

    if (!isLastQuestion) {
      const nextIndex =
        currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);

      const nextQuestion =
        normalizedQuestions[nextIndex];

      setAnswer(
        nextQuestion?.id &&
          submittedAnswers[nextQuestion.id]
          ? submittedAnswers[nextQuestion.id]
          : ""
      );

      return;
    }

    await handleCompleteInterview();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) {
      return;
    }

    setActionError("");

    const previousIndex =
      currentQuestionIndex - 1;

    setCurrentQuestionIndex(previousIndex);

    const previousQuestion =
      normalizedQuestions[previousIndex];

    setAnswer(
      previousQuestion?.id &&
        submittedAnswers[previousQuestion.id]
        ? submittedAnswers[previousQuestion.id]
        : ""
    );
  };

  const handleCompleteInterview = async () => {
    setActionError("");

    try {
      const result =
        await completeInterviewMutation.mutateAsync(
          interviewId
        );

      navigate(
        `/interviews/${interviewId}/result`,
        {
          state: {
            result,
          },
        }
      );
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to complete the interview."
        )
      );
    }
  };

  if (
    isInterviewLoading ||
    isQuestionsLoading
  ) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing your interview...
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
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/interviews/${interviewId}`
              )
            }
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to interview
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

              <div>
                <h1 className="text-lg font-semibold text-white">
                  Unable to load interview
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {getApiErrorMessage(
                    interviewError ||
                      questionsError,
                    "Something went wrong while loading the interview."
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                refetchQuestions()
              }
              className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/interviews/${interviewId}`
              )
            }
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to interview
          </button>

          <div className="rounded-2xl border border-zinc-800 bg-[#080b09] p-10 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-zinc-600" />

            <h1 className="mt-4 text-lg font-semibold text-white">
              No interview questions found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              This interview does not contain any
              questions yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/interviews/${interviewId}`
                )
              }
              className="mt-6 rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-lime-300"
            >
              Back to interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/interviews/${interviewId}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit interview
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
                AI Mock Interview
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {interview.technologyName ||
                  "Technical Interview"}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {String(
                  interview.difficulty || ""
                )
                  .toLowerCase()
                  .replace(/_/g, " ")}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Question
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {currentQuestionNumber}
                <span className="text-zinc-600">
                  {" "}
                  / {totalQuestions}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Interview progress
            </span>

            <span className="text-zinc-400">
              {progressPercentage}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-lime-400 transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <section className="rounded-2xl border border-zinc-800 bg-[#080b09] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/5 text-sm font-semibold text-lime-300">
              {currentQuestion.questionNumber ??
                currentQuestionNumber}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                Interview question
              </p>

              <h2 className="mt-3 text-lg font-medium leading-8 text-zinc-100 sm:text-xl">
                {currentQuestion.questionText}
              </h2>
            </div>
          </div>

          {/* Answer */}
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
                isBusy ||
                isCurrentQuestionSubmitted
              }
              rows={10}
              placeholder="Explain your answer clearly. Include examples or reasoning where relevant."
              className="w-full resize-y rounded-xl border border-zinc-800 bg-[#050706] px-4 py-4 text-sm leading-7 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-zinc-600">
                {isCurrentQuestionSubmitted
                  ? "Answer submitted and locked."
                  : "Take your time and answer as you would in a real interview."}
              </p>

              <p className="text-xs text-zinc-600">
                {answer.length} characters
              </p>
            </div>
          </div>

          {/* Error */}
          {actionError && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <p className="text-sm leading-6 text-red-300">
                {actionError}
              </p>
            </div>
          )}

          {/* Submitted state */}
          {isCurrentQuestionSubmitted && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-lime-400/15 bg-lime-400/[0.03] px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-lime-400" />

              <p className="text-sm text-lime-300">
                Your answer has been submitted.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={
                currentQuestionIndex === 0 ||
                isBusy
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {!isCurrentQuestionSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={
                    isBusy ||
                    !answer.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit answer
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  isBusy ||
                  (!isCurrentQuestionSubmitted &&
                    !answer.trim())
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime-400 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : isLastQuestion ? (
                  <>
                    Complete interview
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next question
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Question indicators */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {normalizedQuestions.map(
            (question, index) => {
              const isSubmitted =
                question?.id !== undefined &&
                question?.id !== null &&
                Boolean(
                  submittedAnswers[question.id]
                );

              const isCurrent =
                index === currentQuestionIndex;

              return (
                <button
                  key={
                    question.id ??
                    `question-${index}`
                  }
                  type="button"
                  onClick={() => {
                    if (isBusy) {
                      return;
                    }

                    setActionError("");
                    setCurrentQuestionIndex(index);
                    setAnswer(
                      question?.id &&
                        submittedAnswers[
                          question.id
                        ]
                        ? submittedAnswers[
                            question.id
                          ]
                        : ""
                    );
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition ${
                    isCurrent
                      ? "border-lime-400 bg-lime-400 text-black"
                      : isSubmitted
                        ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {isSubmitted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    question.questionNumber ??
                    index + 1
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewQuestionsPage;