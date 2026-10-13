import {
  AlertCircle,
  ChevronRight,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useCreateInterview,
  useInterviews,
} from "./useInterview";

import { useMySkills } from "../skills/useSkillIntelligence";

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return "—";
  }

  return String(difficulty)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(status) {
  if (!status) {
    return "—";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function InterviewPage() {
  const navigate = useNavigate();

  const {
    data: interviews,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useInterviews();

  const {
    data: skills,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
    error: skillsError,
  } = useMySkills();

  const createInterviewMutation = useCreateInterview();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [technologyId, setTechnologyId] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [actionError, setActionError] = useState("");

  const normalizedInterviews = useMemo(() => {
    if (!Array.isArray(interviews)) {
      return [];
    }

    return [...interviews].sort((a, b) => {
      const dateA = new Date(
        a?.updatedAt ||
          a?.completedAt ||
          a?.startedAt ||
          0
      ).getTime();

      const dateB = new Date(
        b?.updatedAt ||
          b?.completedAt ||
          b?.startedAt ||
          0
      ).getTime();

      return dateB - dateA;
    });
  }, [interviews]);

  const normalizedSkills = useMemo(() => {
    if (!Array.isArray(skills)) {
      return [];
    }

    return skills
      .map((skill) => ({
        technologyId:
          skill?.technologyId ??
          skill?.technology?.id ??
          skill?.id ??
          null,

        technologyName:
          skill?.technologyName ??
          skill?.technology?.name ??
          skill?.name ??
          null,
      }))
      .filter(
        (skill) =>
          skill.technologyId !== null &&
          skill.technologyName
      );
  }, [skills]);

  const handleOpenCreate = () => {
    setActionError("");

    if (normalizedSkills.length === 0) {
      navigate("/resume");
      return;
    }

    if (!technologyId) {
      setTechnologyId(
        String(normalizedSkills[0].technologyId)
      );
    }

    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (createInterviewMutation.isPending) {
      return;
    }

    setIsCreateOpen(false);
    setActionError("");
  };

  const handleCreateInterview = async (event) => {
    event.preventDefault();

    setActionError("");

    if (!technologyId) {
      setActionError("Please select a technology.");
      return;
    }

    try {
      const createdInterview =
        await createInterviewMutation.mutateAsync({
          technologyId: Number(technologyId),
          difficulty,
        });

      /*
       * InterviewResponse:
       *
       * Long id
       * Long technologyId
       * String technologyName
       * InterviewDifficulty difficulty
       * InterviewStatus status
       * Integer questionCount
       * Integer score
       * LocalDateTime startedAt
       * LocalDateTime completedAt
       */

      const createdInterviewId =
        createdInterview?.id;

      if (
        createdInterviewId === null ||
        createdInterviewId === undefined
      ) {
        setActionError(
          "Interview was created, but the server did not return an interview ID."
        );
        return;
      }

      setIsCreateOpen(false);

      /*
       * IMPORTANT:
       * Do not navigate to "/" or an undefined route.
       * Always use the ID returned by the backend.
       */
      navigate(
        `/interviews/${createdInterviewId}`
      );
    } catch (createError) {
      setActionError(
        getApiErrorMessage(
          createError,
          "Unable to create the interview."
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading interviews...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />

              <h2 className="text-lg font-semibold">
                Unable to load interviews
              </h2>
            </div>

            <p className="mt-2 text-sm text-zinc-400">
              {getApiErrorMessage(
                error,
                "Something went wrong while loading your interviews."
              )}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-[#050706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
                AI Mock Interview
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Practice like it&apos;s real.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Simulate technical interviews with
                AI-generated questions based on your
                actual skill profile.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-lime-300"
            >
              <Plus className="h-4 w-4" />
              Create interview
            </button>
          </div>

          {/* Refresh */}
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* Empty */}
          {normalizedInterviews.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#080b09] p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/5">
                <Sparkles className="h-5 w-5 text-lime-400" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                Start your first AI interview
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Choose a technology from your skill
                profile and let SkillNexus generate a
                focused technical interview.
              </p>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-lime-300"
              >
                <Plus className="h-4 w-4" />
                Start interview
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {normalizedInterviews.map(
                (interview, index) => (
                  <button
                    key={
                      interview?.id ??
                      `interview-${index}`
                    }
                    type="button"
                    onClick={() => {
                      if (interview?.id !== null &&
                          interview?.id !== undefined) {
                        navigate(
                          `/interviews/${interview.id}`
                        );
                      }
                    }}
                    className="group flex w-full flex-col gap-4 rounded-2xl border border-zinc-800 bg-[#080b09] p-5 text-left transition hover:border-zinc-700 hover:bg-[#0a0e0b] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-white">
                          {interview?.technologyName ||
                            "Interview"}
                        </h2>

                        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                          {formatDifficulty(
                            interview?.difficulty
                          )}
                        </span>

                        <span className="rounded-full border border-lime-400/20 bg-lime-400/5 px-2.5 py-1 text-[11px] font-medium text-lime-300">
                          {formatStatus(
                            interview?.status
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
                        <span>
                          {interview?.questionCount ??
                            0}{" "}
                          questions
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(
                            interview?.completedAt ||
                              interview?.startedAt
                          )}
                        </span>

                        {interview?.score !== null &&
                          interview?.score !==
                            undefined && (
                            <span className="text-lime-400">
                              Score:{" "}
                              {interview.score}%
                            </span>
                          )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Interview Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#080b09] shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-zinc-800 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
                  AI Mock Interview
                </p>

                <h2 className="mt-3 text-xl font-semibold text-white">
                  Start a new interview
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Choose a technology and difficulty.
                  SkillNexus will generate the interview
                  questions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreate}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <form
              onSubmit={handleCreateInterview}
              className="p-6"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="interview-technology"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Technology
                  </label>

                  <select
                    id="interview-technology"
                    value={technologyId}
                    onChange={(event) =>
                      setTechnologyId(
                        event.target.value
                      )
                    }
                    disabled={
                      isSkillsLoading ||
                      createInterviewMutation.isPending
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-[#050706] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-lime-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {normalizedSkills.length === 0 ? (
                      <option value="">
                        No technologies available
                      </option>
                    ) : (
                      normalizedSkills.map((skill) => (
                        <option
                          key={skill.technologyId}
                          value={skill.technologyId}
                        >
                          {skill.technologyName}
                        </option>
                      ))
                    )}
                  </select>

                  {isSkillsError && (
                    <p className="mt-2 text-xs text-red-400">
                      {getApiErrorMessage(
                        skillsError,
                        "Unable to load your skills."
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="interview-difficulty"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Difficulty
                  </label>

                  <select
                    id="interview-difficulty"
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(event.target.value)
                    }
                    disabled={
                      createInterviewMutation.isPending
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-[#050706] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-lime-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="EASY">
                      Easy
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HARD">
                      Hard
                    </option>
                  </select>
                </div>

                {actionError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm leading-5 text-red-300">
                      {actionError}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  disabled={
                    createInterviewMutation.isPending
                  }
                  className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createInterviewMutation.isPending ||
                    isSkillsLoading ||
                    normalizedSkills.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createInterviewMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Start interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default InterviewPage;