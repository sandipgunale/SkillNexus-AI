import {
  ClipboardList,
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  useMyJobs,
  useMyResumes,
} from "../dashboard/useDashboardData";

import {
  useCreatePreparationPlan,
  useGeneratePreparationPlan,
  usePreparationPlans,
} from "./usePreparationPlan";

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getPlanProgress(plan) {
  const items = Array.isArray(plan?.items)
    ? plan.items
    : [];

  if (items.length === 0) {
    return 0;
  }

  const completedItems = items.filter(
    (item) =>
      String(item?.status || "").toUpperCase() ===
      "COMPLETED"
  ).length;

  return Math.round(
    (completedItems / items.length) * 100
  );
}

function getPriorityClasses(priority) {
  const normalized = String(
    priority || ""
  ).toUpperCase();

  if (normalized === "HIGH") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  if (normalized === "MEDIUM") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-white/10 bg-white/[0.04] text-white/60";
}

function PreparationPlanPage() {
  const navigate = useNavigate();

  const {
    data: plans = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePreparationPlans();

  const createPlanMutation =
    useCreatePreparationPlan();

  const generatePlanMutation =
    useGeneratePreparationPlan();

  const {
    data: resumes = [],
    isLoading: isLoadingResumes,
  } = useMyResumes();

  const {
    data: jobs = [],
    isLoading: isLoadingJobs,
  } = useMyJobs();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [isGenerateOpen, setIsGenerateOpen] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [selectedResumeId, setSelectedResumeId] =
    useState("");

  const [
    selectedJobDescriptionId,
    setSelectedJobDescriptionId,
  ] = useState("");

  const sortedPlans = useMemo(() => {
    if (!Array.isArray(plans)) {
      return [];
    }

    return [...plans];
  }, [plans]);

  const normalizedResumes = useMemo(() => {
    if (!Array.isArray(resumes)) {
      return [];
    }

    return resumes.filter(
      (resume) => resume?.id != null
    );
  }, [resumes]);

  const normalizedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) {
      return [];
    }

    return jobs.filter(
      (job) => job?.id != null
    );
  }, [jobs]);

  function handleOpenCreate() {
    setTitle("");
    setDescription("");
    createPlanMutation.reset();
    setIsCreateOpen(true);
  }

  function handleCloseCreate() {
    if (createPlanMutation.isPending) {
      return;
    }

    setIsCreateOpen(false);
  }

  function handleOpenGenerate() {
    generatePlanMutation.reset();

    setSelectedResumeId(
      normalizedResumes[0]?.id
        ? String(normalizedResumes[0].id)
        : ""
    );

    setSelectedJobDescriptionId(
      normalizedJobs[0]?.id
        ? String(normalizedJobs[0].id)
        : ""
    );

    setIsGenerateOpen(true);
  }

  function handleCloseGenerate() {
    if (generatePlanMutation.isPending) {
      return;
    }

    setIsGenerateOpen(false);
  }

  function handleCreatePlan(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription =
      description.trim();

    if (!trimmedTitle) {
      return;
    }

    createPlanMutation.mutate(
      {
        title: trimmedTitle,
        description:
          trimmedDescription || undefined,
      },
      {
        onSuccess: (createdPlan) => {
          setIsCreateOpen(false);

          if (createdPlan?.id != null) {
            navigate(
              `/preparation/${createdPlan.id}`
            );
          }
        },
      }
    );
  }

  function handleGeneratePlan(event) {
    event.preventDefault();

    if (
      !selectedResumeId ||
      !selectedJobDescriptionId
    ) {
      return;
    }

    generatePlanMutation.mutate(
      {
        resumeId: Number(selectedResumeId),
        jobDescriptionId: Number(
          selectedJobDescriptionId
        ),
      },
      {
        onSuccess: (generatedPlan) => {
          setIsGenerateOpen(false);

          if (generatedPlan?.id != null) {
            navigate(
              `/preparation/${generatedPlan.id}`
            );
          }
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0a0a0a] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-white/10" />

            <div className="h-4 w-96 max-w-full rounded bg-white/5" />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full bg-[#0a0a0a] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-400/10 p-3">
                <ClipboardList
                  size={20}
                  className="text-red-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-white">
                  Unable to load preparation plans
                </h2>

                <p className="mt-1 text-sm leading-6 text-white/55">
                  {getApiErrorMessage(error)}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0a0a0a] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-300">
              <Target size={16} />
              <span>Preparation Plan</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Prepare with direction.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
              Turn your identified skill gaps into
              focused preparation work and track your
              progress as you build job readiness.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenGenerate}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/[0.1]"
            >
              <Sparkles size={16} />
              Generate from job match
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              <Plus size={16} />
              Create plan
            </button>
          </div>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {sortedPlans.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center py-12">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <ClipboardList
                  size={24}
                  className="text-emerald-300"
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No preparation plans yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Generate a preparation plan from your
                resume and a job description, or create
                a plan manually.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleOpenGenerate}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  <Sparkles size={16} />
                  Generate from job match
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Plus size={16} />
                  Create manually
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                PLAN SUMMARY
            ================================================== */}

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">
                  Your plans
                </p>

                <p className="mt-1 text-sm text-white/65">
                  {sortedPlans.length}{" "}
                  {sortedPlans.length === 1
                    ? "plan"
                    : "plans"}{" "}
                  available
                </p>
              </div>
            </div>

            {/* ==================================================
                PLAN CARDS
            ================================================== */}

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sortedPlans.map((plan) => {
                const items = Array.isArray(
                  plan?.items
                )
                  ? plan.items
                  : [];

                const progress =
                  getPlanProgress(plan);

                const completedItems =
                  items.filter(
                    (item) =>
                      String(
                        item?.status || ""
                      ).toUpperCase() ===
                      "COMPLETED"
                  ).length;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/preparation/${plan.id}`
                      )
                    }
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:border-emerald-400/25 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 inline-flex rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] p-2">
                          <ClipboardList
                            size={17}
                            className="text-emerald-300"
                          />
                        </div>

                        <h2 className="line-clamp-2 text-base font-semibold text-white">
                          {plan?.title ||
                            "Untitled plan"}
                        </h2>
                      </div>

                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/50">
                        {formatStatus(
                          plan?.status
                        )}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-[66px] text-sm leading-6 text-white/45">
                      {plan?.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-white/40">
                          Progress
                        </span>

                        <span className="font-medium text-white/70">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-xs text-white/40">
                        {completedItems} of{" "}
                        {items.length} completed
                      </span>

                      <span className="text-xs font-medium text-emerald-300 opacity-0 transition group-hover:opacity-100">
                        Open plan →
                      </span>
                    </div>

                    {items.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {items
                          .slice(0, 3)
                          .map((item) => (
                            <span
                              key={item.id}
                              className={`rounded-full border px-2.5 py-1 text-[11px] ${getPriorityClasses(
                                item?.priority
                              )}`}
                            >
                              {item?.technologyName ||
                                item?.skill ||
                                "Skill"}
                            </span>
                          ))}

                        {items.length > 3 && (
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/40">
                            +{items.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ======================================================
          CREATE PLAN MODAL
      ====================================================== */}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create preparation plan
                </h2>

                <p className="mt-1 text-sm leading-6 text-white/45">
                  Create a focused plan for your
                  preparation work.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreate}
                disabled={
                  createPlanMutation.isPending
                }
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreatePlan}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="preparation-plan-title"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Title
                </label>

                <input
                  id="preparation-plan-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  maxLength={150}
                  placeholder="e.g. Java Backend Interview Preparation"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400/40"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="preparation-plan-description"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Description
                </label>

                <textarea
                  id="preparation-plan-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe what you want to prepare for..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-emerald-400/40"
                />

                <div className="mt-1 text-right text-[11px] text-white/25">
                  {description.length}/2000
                </div>
              </div>

              {createPlanMutation.isError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm leading-6 text-red-300">
                  {getApiErrorMessage(
                    createPlanMutation.error
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  disabled={
                    createPlanMutation.isPending
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createPlanMutation.isPending ||
                    !title.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createPlanMutation.isPending ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      Create plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          GENERATE FROM JOB MATCH MODAL
      ====================================================== */}

      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] p-2">
                  <Sparkles
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Generate preparation plan
                </h2>

                <p className="mt-1 text-sm leading-6 text-white/45">
                  Use your resume and a job description
                  to generate focused preparation work.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseGenerate}
                disabled={
                  generatePlanMutation.isPending
                }
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleGeneratePlan}
              className="mt-6 space-y-5"
            >
              {/* ==================== RESUME ==================== */}

              <div>
                <label
                  htmlFor="preparation-resume"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-white/75"
                >
                  <FileText
                    size={15}
                    className="text-white/40"
                  />
                  Resume
                </label>

                <select
                  id="preparation-resume"
                  value={selectedResumeId}
                  onChange={(event) =>
                    setSelectedResumeId(
                      event.target.value
                    )
                  }
                  disabled={
                    isLoadingResumes ||
                    generatePlanMutation.isPending
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option
                    value=""
                    className="bg-[#111111]"
                  >
                    {isLoadingResumes
                      ? "Loading resumes..."
                      : normalizedResumes.length === 0
                      ? "No resumes available"
                      : "Select a resume"}
                  </option>

                  {normalizedResumes.map(
                    (resume) => (
                      <option
                        key={resume.id}
                        value={resume.id}
                        className="bg-[#111111]"
                      >
                        {resume.fileName ||
                          `Resume #${resume.id}`}
                      </option>
                    )
                  )}
                </select>

                {normalizedResumes.length === 0 &&
                  !isLoadingResumes && (
                    <p className="mt-2 text-xs leading-5 text-amber-300/70">
                      Upload a resume before generating
                      a preparation plan.
                    </p>
                  )}
              </div>

              {/* ================= JOB DESCRIPTION =============== */}

              <div>
                <label
                  htmlFor="preparation-job"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-white/75"
                >
                  <Target
                    size={15}
                    className="text-white/40"
                  />
                  Job description
                </label>

                <select
                  id="preparation-job"
                  value={
                    selectedJobDescriptionId
                  }
                  onChange={(event) =>
                    setSelectedJobDescriptionId(
                      event.target.value
                    )
                  }
                  disabled={
                    isLoadingJobs ||
                    generatePlanMutation.isPending
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option
                    value=""
                    className="bg-[#111111]"
                  >
                    {isLoadingJobs
                      ? "Loading job descriptions..."
                      : normalizedJobs.length === 0
                      ? "No job descriptions available"
                      : "Select a job description"}
                  </option>

                  {normalizedJobs.map((job) => (
                    <option
                      key={job.id}
                      value={job.id}
                      className="bg-[#111111]"
                    >
                      {job.title ||
                        `Job #${job.id}`}
                    </option>
                  ))}
                </select>

                {normalizedJobs.length === 0 &&
                  !isLoadingJobs && (
                    <p className="mt-2 text-xs leading-5 text-amber-300/70">
                      Create a job description before
                      generating a preparation plan.
                    </p>
                  )}
              </div>

              {/* ===================== ERROR ====================== */}

              {generatePlanMutation.isError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm leading-6 text-red-300">
                  {getApiErrorMessage(
                    generatePlanMutation.error
                  )}
                </div>
              )}

              {/* ===================== ACTIONS ==================== */}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseGenerate}
                  disabled={
                    generatePlanMutation.isPending
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    generatePlanMutation.isPending ||
                    !selectedResumeId ||
                    !selectedJobDescriptionId ||
                    normalizedResumes.length ===
                      0 ||
                    normalizedJobs.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatePlanMutation.isPending ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreparationPlanPage;