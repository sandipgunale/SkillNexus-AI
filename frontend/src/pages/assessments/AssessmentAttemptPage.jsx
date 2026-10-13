import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Send,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAssessment,
  useSubmitAssessment,
  useSubmitAssessmentAnswer,
} from "./useAssessment";

/* ============================================================
   HELPERS
============================================================ */

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return "Assessment";
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

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-5 w-40 animate-pulse rounded bg-white/[0.06]" />

      <div className="rounded-2xl border border-white/5 bg-[#080a08] p-6 sm:p-8">
        <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-5 h-7 w-full max-w-3xl animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-3 h-7 w-2/3 animate-pulse rounded bg-white/[0.04]" />

        <div className="mt-8 space-y-3">
          <div className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ERROR STATE
============================================================ */

function ErrorState({
  onBack,
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <CircleAlert
          size={21}
          className="text-[#95d600]"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#f4f6f3]">
        Unable to load assessment
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        The assessment questions could not be
        retrieved. Please try again.
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
          Back
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ANSWER OPTION
============================================================ */

function AnswerOption({
  option,
  index,
  selected,
  disabled,
  onSelect,
}) {
  const isSelected =
    selected === option;

  const letter =
    String.fromCharCode(
      65 + index
    );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        onSelect(option)
      }
      className={`group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
        isSelected
          ? "border-[#95d600]/40 bg-[#95d600]/[0.07]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      } ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : ""
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition ${
          isSelected
            ? "border-[#95d600]/40 bg-[#95d600]/10 text-[#95d600]"
            : "border-white/10 bg-white/[0.02] text-white/45 group-hover:text-white/70"
        }`}
      >
        {letter}
      </span>

      <span
        className={`min-w-0 flex-1 text-sm leading-6 ${
          isSelected
            ? "text-[#f4f6f3]"
            : "text-white/60"
        }`}
      >
        {option}
      </span>

      {isSelected && (
        <CheckCircle2
          size={18}
          className="shrink-0 text-[#95d600]"
        />
      )}
    </button>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AssessmentAttemptPage() {
  const navigate = useNavigate();

  const {
    assessmentId,
    attemptId,
  } = useParams();

  const {
    data: assessment,
    isLoading,
    error,
    refetch,
  } = useAssessment(
    assessmentId
  );

  const submitAnswer =
    useSubmitAssessmentAnswer();

  const submitAssessment =
    useSubmitAssessment();

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState("");

  const [
    submittedAnswers,
    setSubmittedAnswers,
  ] = useState({});

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    isFinishing,
    setIsFinishing,
  ] = useState(false);

  /* ==========================================================
     QUESTIONS
  ========================================================== */

  const questions = useMemo(() => {
    if (
      !Array.isArray(
        assessment?.questions
      )
    ) {
      return [];
    }

    return assessment.questions;
  }, [assessment]);

  const currentQuestion =
    questions[
      currentQuestionIndex
    ];

  const totalQuestions =
    questions.length;

  const isLastQuestion =
    currentQuestionIndex ===
    totalQuestions - 1;

  const answeredCount =
    Object.keys(
      submittedAnswers
    ).length;

  /* ==========================================================
     SYNC SELECTED ANSWER
  ========================================================== */

  useEffect(() => {
    if (!currentQuestion?.id) {
      setSelectedAnswer("");
      return;
    }

    setSelectedAnswer(
      submittedAnswers[
        currentQuestion.id
      ] ?? ""
    );
  }, [
    currentQuestion,
    submittedAnswers,
  ]);

  /* ==========================================================
     SUBMIT CURRENT ANSWER
  ========================================================== */

  const handleSubmitAnswer =
    async () => {
      if (
        !assessmentId ||
        !attemptId ||
        !currentQuestion?.id ||
        !selectedAnswer
      ) {
        return false;
      }

      setActionError("");

      try {
        await submitAnswer.mutateAsync({
          assessmentId:
            Number(assessmentId),

          attemptId:
            Number(attemptId),

          questionId:
            currentQuestion.id,

          selectedAnswer,
        });

        setSubmittedAnswers(
          (previous) => ({
            ...previous,
            [currentQuestion.id]:
              selectedAnswer,
          })
        );

        return true;
      } catch (submissionError) {
        setActionError(
          submissionError?.message ??
            "Unable to submit your answer. Please try again."
        );

        return false;
      }
    };

  /* ==========================================================
     MOVE TO NEXT QUESTION
  ========================================================== */

  const handleNext = async () => {
    const alreadySubmitted =
      Boolean(
        submittedAnswers[
          currentQuestion?.id
        ]
      );

    /*
     * If the answer hasn't been submitted,
     * submit it first.
     *
     * Only move forward when the submission
     * succeeds.
     */
    if (!alreadySubmitted) {
      const submitted =
        await handleSubmitAnswer();

      if (!submitted) {
        return;
      }
    }

    setActionError("");

    setCurrentQuestionIndex(
      (previous) =>
        Math.min(
          previous + 1,
          totalQuestions - 1
        )
    );
  };

  /* ==========================================================
     FINISH ASSESSMENT
  ========================================================== */

  const handleFinish = async () => {
    if (
      !assessmentId ||
      !attemptId
    ) {
      return;
    }

    setActionError("");
    setIsFinishing(true);

    try {
      /*
       * If the final question has not been submitted yet,
       * submit it before completing the attempt.
       */
      const finalQuestionSubmitted =
        Boolean(
          submittedAnswers[
            currentQuestion?.id
          ]
        );

      if (
        !finalQuestionSubmitted
      ) {
        if (!selectedAnswer) {
          setActionError(
            "Please select an answer before submitting the assessment."
          );

          setIsFinishing(false);
          return;
        }

        await submitAnswer.mutateAsync({
          assessmentId:
            Number(assessmentId),

          attemptId:
            Number(attemptId),

          questionId:
            currentQuestion.id,

          selectedAnswer,
        });

        setSubmittedAnswers(
          (previous) => ({
            ...previous,
            [currentQuestion.id]:
              selectedAnswer,
          })
        );
      }

      const result =
        await submitAssessment.mutateAsync({
          assessmentId:
            Number(assessmentId),

          attemptId:
            Number(attemptId),
        });

      navigate(
        `/assessments/${assessmentId}/attempt/${attemptId}/result`,
        {
          replace: true,
          state: {
            result,
          },
        }
      );
    } catch (submissionError) {
      setActionError(
        submissionError?.message ??
          "Unable to submit the assessment. Please try again."
      );

      setIsFinishing(false);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !assessment
  ) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <ErrorState
            onRetry={refetch}
            onBack={() =>
              navigate(
                `/assessments/${assessmentId}`
              )
            }
          />
        </div>
      </div>
    );
  }

  /* ==========================================================
     NO QUESTIONS
  ========================================================== */

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="rounded-2xl border border-white/10 bg-[#080a08] px-6 py-12 text-center">
            <CircleAlert
              size={22}
              className="mx-auto text-[#95d600]"
            />

            <h2 className="mt-4 text-lg font-semibold">
              No questions available
            </h2>

            <p className="mt-2 text-sm text-white/40">
              This assessment doesn't contain any
              questions to answer.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/assessments/${assessmentId}`
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white"
            >
              <ArrowLeft size={15} />
              Back to Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questionNumber =
    currentQuestionIndex + 1;

  const currentAnswerSubmitted =
    Boolean(
      submittedAnswers[
        currentQuestion?.id
      ]
    );

  const progressPercentage =
    Math.round(
      (answeredCount /
        totalQuestions) *
        100
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ==================================================
            TOP NAVIGATION
        ================================================== */}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/assessments/${assessmentId}`
              )
            }
            disabled={
              submitAnswer.isPending ||
              isFinishing
            }
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            Exit assessment
          </button>

          <span className="text-xs text-white/35">
            {formatDifficulty(
              assessment.difficulty
            )}
          </span>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-[#95d600]">
                {assessment.technologyName}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Technical Assessment
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-white/35">
                Question
              </p>

              <p className="mt-1 text-sm font-medium text-white/70">
                {questionNumber}{" "}
                <span className="text-white/30">
                  / {totalQuestions}
                </span>
              </p>
            </div>
          </div>

          {/* PROGRESS */}

          <div className="mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#95d600] transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-white/30">
              <span>
                {answeredCount} answered
              </span>

              <span>
                {totalQuestions -
                  answeredCount}{" "}
                remaining
              </span>
            </div>
          </div>
        </header>

        {/* ==================================================
            QUESTION
        ================================================== */}

        <main className="mt-7">
          <section className="rounded-2xl border border-white/10 bg-[#080a08] p-5 sm:p-7">

            {/* QUESTION NUMBER */}

            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/30">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#95d600]/20 bg-[#95d600]/[0.05] text-[#95d600]">
                {questionNumber}
              </span>

              Question
            </div>

            {/* QUESTION TEXT */}

            <h2 className="mt-6 text-lg font-medium leading-8 text-[#f4f6f3] sm:text-xl">
              {currentQuestion?.questionText}
            </h2>

            {/* OPTIONS */}

            <div className="mt-7 space-y-3">
              {Array.isArray(
                currentQuestion?.options
              ) &&
                currentQuestion.options.map(
                  (
                    option,
                    index
                  ) => (
                    <AnswerOption
                      key={`${currentQuestion.id}-${index}`}
                      option={option}
                      index={index}
                      selected={
                        selectedAnswer
                      }
                      disabled={
                        currentAnswerSubmitted ||
                        submitAnswer.isPending ||
                        isFinishing
                      }
                      onSelect={
                        setSelectedAnswer
                      }
                    />
                  )
                )}
            </div>

            {/* ANSWER SUBMITTED */}

            {currentAnswerSubmitted && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#95d600]/15 bg-[#95d600]/[0.04] px-4 py-3 text-xs text-white/50">
                <CheckCircle2
                  size={15}
                  className="shrink-0 text-[#95d600]"
                />

                Answer submitted. You can
                continue to the next question.
              </div>
            )}

            {/* ERROR */}

            {actionError && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/50">
                <CircleAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-[#95d600]"
                />

                <span>
                  {actionError}
                </span>
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={
                  currentQuestionIndex ===
                    0 ||
                  submitAnswer.isPending ||
                  isFinishing
                }
                onClick={() =>
                  setCurrentQuestionIndex(
                    (previous) =>
                      Math.max(
                        previous - 1,
                        0
                      )
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              {/* NEXT */}

              {!isLastQuestion ? (
                <button
                  type="button"
                  disabled={
                    !selectedAnswer ||
                    submitAnswer.isPending ||
                    isFinishing
                  }
                  onClick={
                    handleNext
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitAnswer.isPending ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {currentAnswerSubmitted
                        ? "Next question"
                        : "Submit & Continue"}

                      <ArrowRight
                        size={15}
                      />
                    </>
                  )}
                </button>
              ) : (
                /* FINAL SUBMIT */

                <button
                  type="button"
                  disabled={
                    !selectedAnswer ||
                    submitAnswer.isPending ||
                    isFinishing
                  }
                  onClick={
                    handleFinish
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isFinishing ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Assessment
                      <Send size={15} />
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        </main>

        {/* ==================================================
            FOOTER INFO
        ================================================== */}

        <p className="mt-5 text-center text-xs leading-5 text-white/25">
          Your answer is submitted before moving to the
          next question. Once submitted, an individual
          answer cannot be changed.
        </p>
      </div>
    </div>
  );
}