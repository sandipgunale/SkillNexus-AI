import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  useAssessments,
  useCreateAssessment,
} from "./useAssessment";

import {
  useMySkills,
} from "../skills/useSkillIntelligence";

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
    }
  ).format(date);
}

function getDifficultyLabel(
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

function getStatusLabel(status) {
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

/* ============================================================
   SKILL NORMALIZATION
============================================================ */

function normalizeSkills(
  skills
) {
  if (!Array.isArray(skills)) {
    return [];
  }

  const mapped = skills
    .map((skill) => {
      const technologyId =
        skill?.technologyId ??
        skill?.technology?.id ??
        skill?.id;

      const technologyName =
        skill?.technologyName ??
        skill?.skillName ??
        skill?.name ??
        skill?.technology?.name ??
        skill?.technology?.technologyName ??
        skill?.technology?.title;

      if (
        technologyId ===
          undefined ||
        technologyId === null ||
        !technologyName ||
        typeof technologyName !==
          "string"
      ) {
        return null;
      }

      return {
        id: technologyId,
        name: technologyName.trim(),
      };
    })
    .filter(Boolean);

  const unique = new Map();

  for (const skill of mapped) {
    const key =
      String(skill.id);

    if (!unique.has(key)) {
      unique.set(
        key,
        skill
      );
    }
  }

  return Array.from(
    unique.values()
  ).sort((first, second) =>
    first.name.localeCompare(
      second.name
    )
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-2xl border border-white/5 bg-[#080a08]"
        />
      ))}
    </div>
  );
}

/* ============================================================
   ERROR
============================================================ */

function ErrorState({
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <RefreshCw
          size={20}
          className="text-[#95d600]"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#f4f6f3]">
        Unable to load assessments
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        We couldn't retrieve your
        assessments. Please try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105"
      >
        <RefreshCw size={15} />
        Try again
      </button>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  onResume,
  onCreate,
  hasSkills,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080a08] px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <BookOpen
          size={23}
          className="text-[#95d600]"
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[#f4f6f3]">
        No assessments yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        {hasSkills
          ? "Create a focused technical assessment from one of the technologies in your skill profile."
          : "Assessments are created for technologies associated with your resume. Analyze your resume first to build your technology profile."}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {hasSkills ? (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105"
          >
            <Plus size={16} />
            Create assessment
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
          >
            Go to Resume
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ASSESSMENT CARD
============================================================ */

function AssessmentCard({
  assessment,
  onOpen,
}) {
  const difficulty =
    getDifficultyLabel(
      assessment?.difficulty
    );

  const status =
    getStatusLabel(
      assessment?.status
    );

  const questionCount =
    assessment?.questionCount;

  return (
    <article className="group flex flex-col rounded-2xl border border-white/10 bg-[#080a08] p-5 transition hover:border-white/15 sm:p-6">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#95d600]/15 bg-[#95d600]/[0.05]">
          <FileQuestion
            size={20}
            className="text-[#95d600]"
          />
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/45">
          {difficulty}
        </span>
      </div>

      {/* TITLE */}

      <div className="mt-5">
        <h2 className="text-lg font-semibold text-[#f4f6f3]">
          {assessment?.technologyName ??
            "Technology Assessment"}
        </h2>

        <p className="mt-1 text-xs text-white/30">
          Created{" "}
          {formatDate(
            assessment?.createdAt
          )}
        </p>
      </div>

      {/* META */}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-white/35">
            <FileQuestion
              size={14}
            />
            Questions
          </div>

          <p className="mt-1.5 text-sm font-medium text-white/75">
            {questionCount ??
              "—"}
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-white/35">
            {assessment?.status ===
            "READY" ? (
              <CheckCircle2
                size={14}
              />
            ) : (
              <Clock3
                size={14}
              />
            )}

            Status
          </div>

          <p className="mt-1.5 text-sm font-medium text-white/75">
            {status}
          </p>
        </div>
      </div>

      {/* ACTION */}

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() =>
            onOpen(
              assessment.id
            )
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#95d600]/20 hover:bg-[#95d600]/[0.05] hover:text-[#95d600]"
        >
          View assessment

          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   CREATE ASSESSMENT MODAL
============================================================ */

function CreateAssessmentModal({
  skills,
  selectedTechnologyId,
  selectedDifficulty,
  onTechnologyChange,
  onDifficultyChange,
  onClose,
  onCreate,
  isCreating,
  error,
}) {
  const canCreate =
    Boolean(
      selectedTechnologyId
    ) &&
    Boolean(
      selectedDifficulty
    ) &&
    !isCreating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-assessment-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#080a08] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#95d600]">
              Assessment Builder
            </p>

            <h2
              id="create-assessment-title"
              className="mt-1.5 text-lg font-semibold text-[#f4f6f3]"
            >
              Create an assessment
            </h2>

            <p className="mt-1 text-xs leading-5 text-white/35">
              Choose a technology and difficulty.
              SkillNexus AI will generate a focused
              technical assessment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/35 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-6 px-5 py-6 sm:px-6">

          {/* TECHNOLOGY */}

          <div>
            <label
              htmlFor="assessment-technology"
              className="text-xs font-medium text-white/55"
            >
              Technology
            </label>

            <select
              id="assessment-technology"
              value={
                selectedTechnologyId
              }
              onChange={(event) =>
                onTechnologyChange(
                  event.target.value
                )
              }
              disabled={isCreating}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#050605] px-3.5 py-3 text-sm text-white/75 outline-none transition focus:border-[#95d600]/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                Select a technology
              </option>

              {skills.map((skill) => (
                <option
                  key={skill.id}
                  value={skill.id}
                >
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          {/* DIFFICULTY */}

          <div>
            <p className="text-xs font-medium text-white/55">
              Difficulty
            </p>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                "EASY",
                "MEDIUM",
                "HARD",
              ].map(
                (difficulty) => {
                  const selected =
                    selectedDifficulty ===
                    difficulty;

                  return (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() =>
                        onDifficultyChange(
                          difficulty
                        )
                      }
                      disabled={
                        isCreating
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        selected
                          ? "border-[#95d600]/40 bg-[#95d600]/[0.07] text-[#95d600]"
                          : "border-white/10 bg-white/[0.02] text-white/45 hover:border-white/20 hover:text-white/70"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {getDifficultyLabel(
                        difficulty
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* INFO */}

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <p className="text-xs leading-5 text-white/35">
              The generated assessment contains
              focused technical questions based on
              your selected technology and difficulty.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-400/15 bg-red-400/[0.035] px-4 py-3">
              <p className="text-xs leading-5 text-red-300/80">
                {getApiErrorMessage(
                  error,
                  "Unable to create the assessment. Please try again."
                )}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onCreate}
            disabled={!canCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCreating ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Generating...
              </>
            ) : (
              <>
                Generate assessment
                <ArrowRight
                  size={15}
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AssessmentPage() {
  const navigate = useNavigate();

  const {
    data: assessments,
    isLoading,
    error,
    refetch,
  } = useAssessments();

  const {
    data: skills,
    isLoading: isSkillsLoading,
  } = useMySkills();

  const createAssessment =
    useCreateAssessment();

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
    selectedTechnologyId,
    setSelectedTechnologyId,
  ] = useState("");

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] = useState("MEDIUM");

  const assessmentList =
    Array.isArray(assessments)
      ? [...assessments].sort(
          (first, second) => {
            const firstDate =
              new Date(
                first?.updatedAt ??
                  first?.createdAt ??
                  0
              ).getTime();

            const secondDate =
              new Date(
                second?.updatedAt ??
                  second?.createdAt ??
                  0
              ).getTime();

            return (
              secondDate -
              firstDate
            );
          }
        )
      : [];

  const skillList = useMemo(
    () =>
      normalizeSkills(
        skills
      ),
    [skills]
  );

  /* ==========================================================
     CREATE MODAL
  ========================================================== */

  function handleOpenCreateModal() {
    createAssessment.reset();

    if (
      skillList.length === 0
    ) {
      navigate("/resume");
      return;
    }

    setSelectedTechnologyId(
      String(
        skillList[0].id
      )
    );

    setSelectedDifficulty(
      "MEDIUM"
    );

    setIsCreateModalOpen(
      true
    );
  }

  function handleCloseCreateModal() {
    if (
      createAssessment.isPending
    ) {
      return;
    }

    setIsCreateModalOpen(
      false
    );

    createAssessment.reset();
  }

  /* ==========================================================
     CREATE ASSESSMENT
  ========================================================== */

  async function handleCreateAssessment() {
    if (
      !selectedTechnologyId ||
      !selectedDifficulty
    ) {
      return;
    }

    try {
      const createdAssessment =
        await createAssessment.mutateAsync(
          {
            technologyId:
              Number(
                selectedTechnologyId
              ),

            difficulty:
              selectedDifficulty,
          }
        );

      if (
        createdAssessment?.id
      ) {
        setIsCreateModalOpen(
          false
        );

        navigate(
          `/assessments/${createdAssessment.id}`
        );

        return;
      }

      /*
       * Defensive fallback in case the backend
       * creates successfully but does not return
       * the created ID.
       */
      await refetch();

      setIsCreateModalOpen(
        false
      );
    } catch {
      /*
       * The mutation exposes the error through
       * createAssessment.error, which the modal
       * renders.
       */
    }
  }

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <BookOpen
                  size={16}
                  className="text-[#95d600]"
                />
                Assessments
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Test your skills.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Evaluate your technical knowledge with
                focused assessments based on your career
                skill profile.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {assessmentList.length >
                0 && (
                <div className="hidden rounded-xl border border-white/10 bg-[#080a08] px-4 py-3 sm:block">
                  <p className="text-xs text-white/35">
                    Available assessments
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#f4f6f3]">
                    {
                      assessmentList.length
                    }
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleOpenCreateModal
                }
                disabled={
                  isSkillsLoading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#95d600] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSkillsLoading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================
            CONTENT
        ================================================== */}

        {isLoading && (
          <LoadingState />
        )}

        {!isLoading &&
          error && (
            <ErrorState
              onRetry={refetch}
            />
          )}

        {!isLoading &&
          !error &&
          assessmentList.length ===
            0 && (
            <EmptyState
              onResume={() =>
                navigate("/resume")
              }
              onCreate={
                handleOpenCreateModal
              }
              hasSkills={
                skillList.length > 0
              }
            />
          )}

        {!isLoading &&
          !error &&
          assessmentList.length >
            0 && (
            <section className="grid gap-4 md:grid-cols-2">
              {assessmentList.map(
                (assessment) => (
                  <AssessmentCard
                    key={
                      assessment.id
                    }
                    assessment={
                      assessment
                    }
                    onOpen={(id) =>
                      navigate(
                        `/assessments/${id}`
                      )
                    }
                  />
                )
              )}
            </section>
          )}
      </div>

      {/* ======================================================
          CREATE ASSESSMENT MODAL
      ====================================================== */}

      {isCreateModalOpen && (
        <CreateAssessmentModal
          skills={skillList}
          selectedTechnologyId={
            selectedTechnologyId
          }
          selectedDifficulty={
            selectedDifficulty
          }
          onTechnologyChange={
            setSelectedTechnologyId
          }
          onDifficultyChange={
            setSelectedDifficulty
          }
          onClose={
            handleCloseCreateModal
          }
          onCreate={
            handleCreateAssessment
          }
          isCreating={
            createAssessment.isPending
          }
          error={
            createAssessment.error
          }
        />
      )}
    </div>
  );
}