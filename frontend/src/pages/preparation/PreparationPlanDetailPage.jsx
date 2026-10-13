import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Loader2,
  Play,
  RefreshCw,
  Target,
} from "lucide-react";
import {
  useMemo,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useActivatePreparationPlan,
  usePreparationPlan,
  useUpdatePreparationItemStatus,
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

function getStatusClasses(status) {
  const normalized = String(
    status || ""
  ).toUpperCase();

  if (normalized === "COMPLETED") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (
    normalized === "IN_PROGRESS" ||
    normalized === "INPROGRESS"
  ) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-white/10 bg-white/[0.04] text-white/50";
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

  return "border-white/10 bg-white/[0.04] text-white/55";
}

function isCompleted(status) {
  return (
    String(status || "").toUpperCase() ===
    "COMPLETED"
  );
}

function getProgress(items) {
  if (!items.length) {
    return 0;
  }

  const completed = items.filter((item) =>
    isCompleted(item?.status)
  ).length;

  return Math.round(
    (completed / items.length) * 100
  );
}

function PreparationPlanDetailPage() {
  const navigate = useNavigate();
  const { planId } = useParams();

  const {
    data: plan,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePreparationPlan(planId);

  const activateMutation =
    useActivatePreparationPlan();

  const updateStatusMutation =
    useUpdatePreparationItemStatus();

  const items = useMemo(() => {
    return Array.isArray(plan?.items)
      ? plan.items
      : [];
  }, [plan?.items]);

  const progress = useMemo(
    () => getProgress(items),
    [items]
  );

  const completedCount = useMemo(
    () =>
      items.filter((item) =>
        isCompleted(item?.status)
      ).length,
    [items]
  );

  const isPlanActive =
    String(plan?.status || "").toUpperCase() ===
    "ACTIVE";

  function handleActivate() {
    if (
      !planId ||
      activateMutation.isPending
    ) {
      return;
    }

    activateMutation.mutate(Number(planId));
  }

  function handleStatusChange(item, status) {
    if (
      !planId ||
      !item?.id ||
      updateStatusMutation.isPending
    ) {
      return;
    }

    updateStatusMutation.mutate({
      planId: Number(planId),
      itemId: item.id,
      status,
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0a0a0a] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-28 rounded bg-white/10" />

            <div className="h-10 w-80 max-w-full rounded bg-white/10" />

            <div className="h-5 w-[32rem] max-w-full rounded bg-white/5" />

            <div className="h-32 rounded-2xl border border-white/10 bg-white/[0.03]" />

            <div className="space-y-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-36 rounded-2xl border border-white/10 bg-white/[0.03]"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="min-h-full bg-[#0a0a0a] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() =>
              navigate("/preparation")
            }
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to preparation plans
          </button>

          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-400/10 p-3">
                <ClipboardCheck
                  size={20}
                  className="text-red-300"
                />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Unable to load this preparation
                  plan
                </h2>

                <p className="mt-1 text-sm leading-6 text-white/50">
                  {getApiErrorMessage(error)}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
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
      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/preparation")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to preparation plans
        </button>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-300">
              <Target size={16} />

              <span>
                Preparation Plan
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {plan.title}
              </h1>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                  plan.status
                )}`}
              >
                {formatStatus(plan.status)}
              </span>
            </div>

            {plan.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50 sm:text-base">
                {plan.description}
              </p>
            )}
          </div>

          <div className="shrink-0">
            {!isPlanActive && (
              <button
                type="button"
                onClick={handleActivate}
                disabled={
                  activateMutation.isPending
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activateMutation.isPending ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Activating...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Activate plan
                  </>
                )}
              </button>
            )}

            {isPlanActive && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-medium text-emerald-300">
                <CheckCircle2 size={16} />
                Active plan
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            MUTATION ERRORS
        ================================================== */}

        {(activateMutation.isError ||
          updateStatusMutation.isError) && (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm leading-6 text-red-300">
            {getApiErrorMessage(
              activateMutation.isError
                ? activateMutation.error
                : updateStatusMutation.error
            )}
          </div>
        )}

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/40">
                Preparation progress
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-white">
                  {progress}%
                </span>

                <span className="text-sm text-white/40">
                  complete
                </span>
              </div>
            </div>

            <div className="text-sm text-white/45">
              <span className="text-white/75">
                {completedCount}
              </span>{" "}
              of{" "}
              <span className="text-white/75">
                {items.length}
              </span>{" "}
              items completed
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        {/* ==================================================
            ITEMS
        ================================================== */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Preparation items
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Work through these areas and update
              each item as your preparation progresses.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
              <ClipboardCheck
                size={24}
                className="mx-auto text-white/30"
              />

              <h3 className="mt-4 text-base font-semibold text-white">
                No preparation items
              </h3>

              <p className="mt-1 text-sm text-white/40">
                This plan currently has no items to
                track.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const completed = isCompleted(
                  item?.status
                );

                const updating =
                  updateStatusMutation.isPending &&
                  updateStatusMutation.variables
                    ?.itemId === item?.id;

                return (
                  <article
                    key={item?.id ?? index}
                    className={`rounded-2xl border p-5 transition ${
                      completed
                        ? "border-emerald-400/15 bg-emerald-400/[0.025]"
                        : "border-white/10 bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="mt-0.5 shrink-0">
                          {completed ? (
                            <CheckCircle2
                              size={21}
                              className="text-emerald-300"
                            />
                          ) : (
                            <Circle
                              size={21}
                              className="text-white/25"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white">
                              {item?.technologyName ||
                                item?.skill ||
                                `Preparation item ${
                                  index + 1
                                }`}
                            </h3>

                            {item?.priority && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPriorityClasses(
                                  item.priority
                                )}`}
                              >
                                {formatStatus(
                                  item.priority
                                )}
                              </span>
                            )}
                          </div>

                          {item?.skill &&
                            item?.technologyName &&
                            item.skill !==
                              item.technologyName && (
                              <p className="mt-1 text-xs text-white/35">
                                {item.skill}
                              </p>
                            )}

                          {item?.description && (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">
                              {item.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                                item?.status
                              )}`}
                            >
                              {formatStatus(
                                item?.status
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ========================================
                          STATUS ACTIONS
                      ======================================== */}

                      <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-sm lg:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              item,
                              "NOT_STARTED"
                            )
                          }
                          disabled={updating}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            String(
                              item?.status || ""
                            ).toUpperCase() ===
                            "NOT_STARTED"
                              ? "border-white/20 bg-white/[0.09] text-white"
                              : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.07] hover:text-white"
                          }`}
                        >
                          Not started
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              item,
                              "IN_PROGRESS"
                            )
                          }
                          disabled={updating}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            String(
                              item?.status || ""
                            ).toUpperCase() ===
                            "IN_PROGRESS"
                              ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                              : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.07] hover:text-white"
                          }`}
                        >
                          In progress
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              item,
                              "COMPLETED"
                            )
                          }
                          disabled={updating}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            completed
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                              : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.07] hover:text-white"
                          }`}
                        >
                          {updating ? (
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2
                              size={13}
                            />
                          )}

                          Completed
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================
            FOOTER REFRESH
        ================================================== */}

        <div className="mt-8 flex justify-end border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 text-xs text-white/35 transition hover:text-white/65 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreparationPlanDetailPage;