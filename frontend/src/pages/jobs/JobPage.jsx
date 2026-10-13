import {
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  useCreateJob,
  useJobs,
} from "./useJob";

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

function JobPage() {
  const navigate = useNavigate();

  const {
    data: jobs,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useJobs();

  const createJobMutation = useCreateJob();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [title, setTitle] = useState("");
  const [descriptionText, setDescriptionText] =
    useState("");

  const [formError, setFormError] = useState("");

  const normalizedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) {
      return [];
    }

    return [...jobs].sort((firstJob, secondJob) => {
      const firstDate = new Date(
        firstJob?.updatedAt ||
          firstJob?.createdAt ||
          0
      ).getTime();

      const secondDate = new Date(
        secondJob?.updatedAt ||
          secondJob?.createdAt ||
          0
      ).getTime();

      return secondDate - firstDate;
    });
  }, [jobs]);

  function openCreateModal() {
    setFormError("");
    setTitle("");
    setDescriptionText("");
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (createJobMutation.isPending) {
      return;
    }

    setIsCreateOpen(false);
    setFormError("");
  }

  async function handleCreateJob(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription =
      descriptionText.trim();

    if (!trimmedTitle) {
      setFormError(
        "Please enter a job title."
      );
      return;
    }

    if (!trimmedDescription) {
      setFormError(
        "Please paste the job description."
      );
      return;
    }

    setFormError("");

    try {
      const createdJob =
        await createJobMutation.mutateAsync({
          title: trimmedTitle,
          descriptionText:
            trimmedDescription,
        });

      setIsCreateOpen(false);

      setTitle("");
      setDescriptionText("");

      if (createdJob?.id != null) {
        navigate(
          `/jobs/${createdJob.id}`
        );
      }
    } catch (mutationError) {
      setFormError(
        getApiErrorMessage(
          mutationError,
          "Unable to create the job description."
        )
      );
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0b0d0c] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading job descriptions...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
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
              Unable to load job descriptions
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
              {getApiErrorMessage(
                error,
                "Something went wrong while loading your job descriptions."
              )}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0b0d0c] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Job intelligence
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Analyze opportunities with your profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Add a job description, understand its
                requirements, and compare it against
                your resume.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    isFetching
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                <Plus size={17} />
                Add job
              </button>
            </div>
          </header>

          {normalizedJobs.length === 0 ? (
            <section className="rounded-3xl border border-white/10 bg-[#111412] p-8 sm:p-12">
              <div className="mx-auto max-w-xl text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <BriefcaseBusiness
                    size={25}
                    className="text-emerald-300"
                  />
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                  Start with a job description
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Paste a job description to extract its
                  requirements and understand how it
                  aligns with your current profile.
                </p>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  <Sparkles size={17} />
                  Analyze a job
                </button>
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-zinc-200">
                    Your job descriptions
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {normalizedJobs.length}{" "}
                    {normalizedJobs.length === 1
                      ? "job"
                      : "jobs"}{" "}
                    saved
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs text-zinc-600 sm:flex">
                  <Search size={14} />
                  Select a job to inspect it
                </div>
              </div>

              <div className="grid gap-4">
                {normalizedJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/jobs/${job.id}`
                      )
                    }
                    className="group w-full rounded-2xl border border-white/10 bg-[#111412] p-5 text-left transition hover:border-white/15 hover:bg-[#131714]"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                          <FileText
                            size={19}
                            className="text-emerald-300"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-zinc-100 transition group-hover:text-white">
                            {job.title ||
                              "Untitled job"}
                          </h3>

                          <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-500">
                            {job.descriptionText ||
                              "No description available."}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-zinc-400">
                          {formatStatus(job.status)}
                        </span>

                        <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <CalendarDays size={13} />
                          {formatDate(
                            job.updatedAt ||
                              job.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111412] shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  New opportunity
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Add job description
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Paste the job posting you want to
                  analyze.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={
                  createJobMutation.isPending
                }
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateJob}
              className="space-y-5 p-6 sm:p-7"
            >
              <div>
                <label
                  htmlFor="job-title"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Job title
                </label>

                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Java Full Stack Developer"
                  disabled={
                    createJobMutation.isPending
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0c0f0d] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="job-description"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Job description
                </label>

                <textarea
                  id="job-description"
                  value={descriptionText}
                  onChange={(event) =>
                    setDescriptionText(
                      event.target.value
                    )
                  }
                  rows={14}
                  placeholder="Paste the complete job description here..."
                  disabled={
                    createJobMutation.isPending
                  }
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#0c0f0d] px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-2 flex justify-end text-xs text-zinc-600">
                  {descriptionText.length}{" "}
                  characters
                </div>
              </div>

              {formError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
                  <CircleAlert
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={
                    createJobMutation.isPending
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createJobMutation.isPending
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Add job
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

export default JobPage;