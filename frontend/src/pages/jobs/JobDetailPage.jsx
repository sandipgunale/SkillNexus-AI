import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  FileText,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAnalyzeJob,
  useJob,
  useMatchResumeWithJob,
} from "./useJob";

import {
  useMyResumes,
} from "../dashboard/useDashboardData";

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatRequirementType(type) {
  if (!type) {
    return "Requirement";
  }

  return String(type)
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

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function getMatchScoreLabel(score) {
  if (score == null) {
    return "Not available";
  }

  if (score >= 80) {
    return "High alignment";
  }

  if (score >= 60) {
    return "Moderate alignment";
  }

  if (score >= 40) {
    return "Partial alignment";
  }

  return "Significant skill gaps";
}

function getScoreWidth(score) {
  if (score == null) {
    return "0%";
  }

  return `${Math.min(
    100,
    Math.max(0, Number(score))
  )}%`;
}

function getResumeId(resume) {
  return (
    resume?.id ??
    resume?.resumeId ??
    null
  );
}

function getResumeName(resume) {
  return (
    resume?.fileName ||
    resume?.name ||
    resume?.title ||
    `Resume ${getResumeId(resume) ?? ""}`
  );
}

function JobDetailPage() {
  const navigate = useNavigate();
  const { jobDescriptionId } = useParams();

  const {
    data: job,
    isLoading: isJobLoading,
    isError: isJobError,
    error: jobError,
    refetch: refetchJob,
    isFetching: isJobFetching,
  } = useJob(jobDescriptionId);

  const {
    data: resumes,
    isLoading: isResumesLoading,
    isError: isResumesError,
    error: resumesError,
  } = useMyResumes();

  const analyzeJobMutation = useAnalyzeJob();
  const matchResumeMutation =
    useMatchResumeWithJob();

  const [selectedResumeId, setSelectedResumeId] =
    useState("");

  const [matchResult, setMatchResult] =
    useState(null);

  const [actionError, setActionError] =
    useState("");

  const normalizedResumes = useMemo(() => {
    if (!Array.isArray(resumes)) {
      return [];
    }

    return resumes;
  }, [resumes]);

  const requirements = useMemo(() => {
    if (!Array.isArray(job?.requirements)) {
      return [];
    }

    return job.requirements;
  }, [job]);

  const isAnalyzed =
    requirements.length > 0 ||
    String(job?.status || "").toUpperCase() ===
      "ANALYZED";

  const isAnalyzing =
    analyzeJobMutation.isPending;

  const isMatching =
    matchResumeMutation.isPending;

  async function handleAnalyze() {
    setActionError("");

    try {
      const analyzedJob =
        await analyzeJobMutation.mutateAsync(
          Number(jobDescriptionId)
        );

      if (analyzedJob) {
        setMatchResult(null);
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to analyze this job description."
        )
      );
    }
  }

  async function handleMatchResume() {
    setActionError("");

    if (!selectedResumeId) {
      setActionError(
        "Please select a resume before matching."
      );
      return;
    }

    try {
      const result =
        await matchResumeMutation.mutateAsync({
          resumeId: Number(selectedResumeId),
          jobDescriptionId:
            Number(jobDescriptionId),
        });

      setMatchResult(result);
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to match the resume with this job description."
        )
      );
    }
  }

  function handleRefresh() {
    setActionError("");
    refetchJob();
  }

  if (isJobLoading) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading job intelligence...
          </div>
        </div>
      </div>
    );
  }

  if (isJobError || !job) {
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
              Unable to load job description
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
              {getApiErrorMessage(
                jobError,
                "This job description could not be loaded."
              )}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.07]"
              >
                <RefreshCw size={16} />
                Try again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/jobs")
                }
                className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Back to jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0b0d0c] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* ==================================================
              HEADER
          ================================================== */}

          <header>
            <button
              type="button"
              onClick={() =>
                navigate("/jobs")
              }
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to jobs
            </button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <BriefcaseBusiness
                      size={20}
                      className="text-emerald-300"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Job intelligence
                    </p>

                    <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                      {job.title ||
                        "Untitled job"}
                    </h1>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>
                    {formatStatus(job.status)}
                  </span>

                  <span className="text-zinc-700">
                    •
                  </span>

                  <span>
                    Created{" "}
                    {formatDate(job.createdAt)}
                  </span>

                  {job.updatedAt && (
                    <>
                      <span className="text-zinc-700">
                        •
                      </span>

                      <span>
                        Updated{" "}
                        {formatDate(
                          job.updatedAt
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isJobFetching}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      isJobFetching
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Refresh
                </button>

                {!isAnalyzed && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Analyze JD
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* ==================================================
              ACTION ERROR
          ================================================== */}

          {actionError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
              <CircleAlert
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{actionError}</span>
            </div>
          )}

          {/* ==================================================
              JOB DESCRIPTION
          ================================================== */}

          <section className="rounded-3xl border border-white/10 bg-[#111412] p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <FileText
                size={18}
                className="text-emerald-300"
              />

              <h2 className="text-base font-semibold">
                Job description
              </h2>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0c0f0d] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                {job.descriptionText ||
                  "No job description available."}
              </p>
            </div>
          </section>

          {/* ==================================================
              REQUIREMENTS
          ================================================== */}

          <section className="rounded-3xl border border-white/10 bg-[#111412] p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Requirements
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  What this role requires
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Requirements extracted from the job
                  description.
                </p>
              </div>

              <span className="text-sm text-zinc-500">
                {requirements.length}{" "}
                {requirements.length === 1
                  ? "requirement"
                  : "requirements"}
              </span>
            </div>

            {requirements.length === 0 ? (
              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                <Sparkles
                  size={26}
                  className="mx-auto text-zinc-600"
                />

                <p className="mt-4 text-sm font-medium text-zinc-300">
                  This job has not been analyzed yet
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-zinc-500">
                  Analyze the job description to extract
                  structured requirements.
                </p>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Analyze JD
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-7 grid gap-3">
                {requirements.map(
                  (requirement) => (
                    <div
                      key={requirement.id}
                      className="rounded-2xl border border-white/10 bg-[#0d100e] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm leading-6 text-zinc-300">
                          {requirement.requirement}
                        </p>

                        <span className="inline-flex w-fit shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-zinc-500">
                          {formatRequirementType(
                            requirement.type
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ==================================================
              RESUME MATCH
          ================================================== */}

          <section className="rounded-3xl border border-white/10 bg-[#111412] p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Resume matching
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Compare your resume with this role
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Select one of your resumes to identify
                matching skills and gaps against this job
                description.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="resume-select"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Resume
                </label>

                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(event) => {
                    setSelectedResumeId(
                      event.target.value
                    );
                    setMatchResult(null);
                    setActionError("");
                  }}
                  disabled={
                    isResumesLoading ||
                    isMatching
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0c0f0d] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {isResumesLoading
                      ? "Loading resumes..."
                      : "Select a resume"}
                  </option>

                  {normalizedResumes.map(
                    (resume) => {
                      const resumeId =
                        getResumeId(resume);

                      if (resumeId == null) {
                        return null;
                      }

                      return (
                        <option
                          key={resumeId}
                          value={resumeId}
                        >
                          {getResumeName(resume)}
                        </option>
                      );
                    }
                  )}
                </select>

                {isResumesError && (
                  <p className="mt-2 text-xs text-red-300">
                    {getApiErrorMessage(
                      resumesError,
                      "Unable to load your resumes."
                    )}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleMatchResume}
                disabled={
                  !selectedResumeId ||
                  isMatching ||
                  !isAnalyzed
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMatching ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Matching...
                  </>
                ) : (
                  <>
                    <Target size={17} />
                    Match resume
                  </>
                )}
              </button>
            </div>

            {!isAnalyzed && (
              <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
                Analyze the job description before
                matching a resume.
              </div>
            )}

            {normalizedResumes.length === 0 &&
              !isResumesLoading &&
              !isResumesError && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-zinc-500">
                  No resumes are available. Upload a
                  resume first to use resume matching.
                </div>
              )}
          </section>

          {/* ==================================================
              MATCH RESULT
          ================================================== */}

          {matchResult && (
            <section className="rounded-3xl border border-white/10 bg-[#111412] p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Match analysis
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Resume-to-role alignment
                </h2>
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                      <Target
                        size={19}
                        className="text-emerald-300"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Match score
                      </p>

                      <p className="mt-1 text-3xl font-semibold tracking-tight">
                        {matchResult.matchScore}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm font-medium text-zinc-300">
                    {getMatchScoreLabel(
                      matchResult.matchScore
                    )}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{
                        width: getScoreWidth(
                          matchResult.matchScore
                        ),
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    Based on the returned resume and job
                    matching analysis.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-300"
                      />

                      <p className="text-sm font-medium text-zinc-300">
                        Matched skills
                      </p>
                    </div>

                    <p className="mt-3 text-2xl font-semibold">
                      {Array.isArray(
                        matchResult.matchedSkills
                      )
                        ? matchResult.matchedSkills
                            .length
                        : 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-5">
                    <div className="flex items-center gap-2">
                      <XCircle
                        size={17}
                        className="text-red-300"
                      />

                      <p className="text-sm font-medium text-zinc-300">
                        Required gaps
                      </p>
                    </div>

                    <p className="mt-3 text-2xl font-semibold">
                      {Array.isArray(
                        matchResult.missingRequiredSkills
                      )
                        ? matchResult
                            .missingRequiredSkills
                            .length
                        : 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-5">
                    <div className="flex items-center gap-2">
                      <Lightbulb
                        size={17}
                        className="text-amber-300"
                      />

                      <p className="text-sm font-medium text-zinc-300">
                        Skill gaps
                      </p>
                    </div>

                    <p className="mt-3 text-2xl font-semibold">
                      {Array.isArray(
                        matchResult.skillGaps
                      )
                        ? matchResult.skillGaps.length
                        : 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  MATCHED SKILLS
              ================================================== */}

              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={17}
                      className="text-emerald-300"
                    />

                    <h3 className="text-sm font-semibold">
                      Matched skills
                    </h3>
                  </div>

                  {Array.isArray(
                    matchResult.matchedSkills
                  ) &&
                  matchResult.matchedSkills.length >
                    0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {matchResult.matchedSkills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-200"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-600">
                      No matched skills were returned.
                    </p>
                  )}
                </div>

                {/* ==================================================
                    REQUIRED SKILL GAPS
                ================================================== */}

                <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-5">
                  <div className="flex items-center gap-2">
                    <XCircle
                      size={17}
                      className="text-red-300"
                    />

                    <h3 className="text-sm font-semibold">
                      Missing required skills
                    </h3>
                  </div>

                  {Array.isArray(
                    matchResult.missingRequiredSkills
                  ) &&
                  matchResult.missingRequiredSkills
                    .length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {matchResult.missingRequiredSkills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full border border-red-400/15 bg-red-400/5 px-3 py-1.5 text-xs font-medium text-red-200"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-600">
                      No missing required skills were
                      returned.
                    </p>
                  )}
                </div>

                {/* ==================================================
                    PREFERRED SKILL GAPS
                ================================================== */}

                <div className="rounded-2xl border border-white/10 bg-[#0d100e] p-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb
                      size={17}
                      className="text-amber-300"
                    />

                    <h3 className="text-sm font-semibold">
                      Missing preferred skills
                    </h3>
                  </div>

                  {Array.isArray(
                    matchResult.missingPreferredSkills
                  ) &&
                  matchResult.missingPreferredSkills
                    .length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {matchResult.missingPreferredSkills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full border border-amber-400/15 bg-amber-400/5 px-3 py-1.5 text-xs font-medium text-amber-200"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-600">
                      No missing preferred skills were
                      returned.
                    </p>
                  )}
                </div>
              </div>

              {/* ==================================================
                  DETAILED SKILL GAPS
              ================================================== */}

              <div className="mt-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                    Detailed gaps
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    Preparation opportunities
                  </h3>
                </div>

                {!Array.isArray(
                  matchResult.skillGaps
                ) ||
                matchResult.skillGaps.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d100e] p-7 text-center">
                    <CheckCircle2
                      size={25}
                      className="mx-auto text-emerald-300"
                    />

                    <p className="mt-3 text-sm font-medium text-zinc-300">
                      No detailed skill gaps were
                      returned.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4">
                    {matchResult.skillGaps.map(
                      (gap, index) => (
                        <article
                          key={`${gap?.skill ?? "gap"}-${index}`}
                          className="rounded-2xl border border-white/10 bg-[#0d100e] p-5 sm:p-6"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h4 className="text-base font-semibold text-zinc-100">
                                  {gap?.skill ||
                                    "Unnamed skill"}
                                </h4>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {gap?.type && (
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-500">
                                      {gap.type}
                                    </span>
                                  )}

                                  {gap?.importance && (
                                    <span className="rounded-full border border-amber-400/15 bg-amber-400/5 px-2.5 py-1 text-xs text-amber-200">
                                      {gap.importance}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {gap?.reason && (
                              <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                                  Why it matters
                                </p>

                                <p className="mt-2 text-sm leading-6 text-zinc-400">
                                  {gap.reason}
                                </p>
                              </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                                  Resume evidence
                                </p>

                                {Array.isArray(
                                  gap?.resumeEvidence
                                ) &&
                                gap.resumeEvidence
                                  .length > 0 ? (
                                  <ul className="mt-3 space-y-2">
                                    {gap.resumeEvidence.map(
                                      (
                                        evidence,
                                        evidenceIndex
                                      ) => (
                                        <li
                                          key={`${index}-evidence-${evidenceIndex}`}
                                          className="flex gap-2 text-sm leading-6 text-zinc-400"
                                        >
                                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />

                                          <span>
                                            {evidence}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="mt-3 text-sm text-zinc-600">
                                    No resume evidence
                                    returned.
                                  </p>
                                )}
                              </div>

                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                                  Suggested preparation
                                </p>

                                {Array.isArray(
                                  gap?.suggestedPreparation
                                ) &&
                                gap
                                  .suggestedPreparation
                                  .length > 0 ? (
                                  <ul className="mt-3 space-y-2">
                                    {gap.suggestedPreparation.map(
                                      (
                                        preparation,
                                        preparationIndex
                                      ) => (
                                        <li
                                          key={`${index}-preparation-${preparationIndex}`}
                                          className="flex gap-2 text-sm leading-6 text-zinc-400"
                                        >
                                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />

                                          <span>
                                            {
                                              preparation
                                            }
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="mt-3 text-sm text-zinc-600">
                                    No preparation
                                    suggestions returned.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;