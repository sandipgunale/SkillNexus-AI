import { useMemo } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAnalyzeResume,
  useResumeAnalysis,
  useResumeDetail,
} from "./useResumeDetail";

function ResumeDetailPage() {
  const navigate = useNavigate();
  const { resumeId } = useParams();

  const {
    data: resume,
    isLoading: resumeLoading,
    isError: resumeError,
    error: resumeRequestError,
  } = useResumeDetail(resumeId);

  const {
    data: analysis,
    isLoading: analysisLoading,
    isError: analysisError,
    error: analysisRequestError,
  } = useResumeAnalysis(resumeId);

  const analyzeMutation =
    useAnalyzeResume();

  const fileName = getFileName(resume);
  const fileType = getFileType(resume);
  const status = getStatus(resume);

  const extractedText =
    getExtractedText(resume);

  const hasAnalysis = Boolean(
    analysis &&
      typeof analysis === "object"
  );

  const analysisErrorMessage =
    getApiErrorMessage(
      analysisRequestError,
      ""
    );

  const analysisNotFound =
    analysisError &&
    analysisErrorMessage
      .toLowerCase()
      .includes("not found");

  const score =
    getOverallScore(analysis);

  const scoreBreakdown = useMemo(
    () =>
      getScoreBreakdown(analysis),
    [analysis]
  );

  const strengths =
    getStringList(analysis, [
      "strengths",
      "keyStrengths",
      "strongPoints",
    ]);

  const weaknesses =
    getStringList(analysis, [
      "weaknesses",
      "areasForImprovement",
      "improvements",
    ]);

  const recommendations =
    getStringList(analysis, [
      "recommendations",
      "suggestions",
      "actionableRecommendations",
    ]);

  const summary =
    getStringValue(analysis, [
      "summary",
      "overallSummary",
      "professionalSummary",
      "overview",
    ]);

  async function handleAnalyze() {
    try {
      await analyzeMutation.mutateAsync(
        resumeId
      );
    } catch {
      // Mutation error is rendered from mutation state.
    }
  }

  if (resumeLoading) {
    return <PageSkeleton />;
  }

  if (resumeError || !resume) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          resumeRequestError,
          "Unable to load this resume."
        )}
        onBack={() =>
          navigate("/resume")
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050605]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-white/[0.07]">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <button
            type="button"
            onClick={() =>
              navigate("/resume")
            }
            className="mb-6 text-xs font-medium text-white/35 transition-colors hover:text-[#95d600]"
          >
            ← Resume library
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#95d600]">
                Resume intelligence
              </p>

              <h1 className="break-words text-2xl font-semibold tracking-[-0.035em] text-[#f4f6f3] sm:text-3xl">
                {fileName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {fileType}
                </span>

                <span className="h-1 w-1 rounded-full bg-white/15" />

                <span className="text-[10px] text-white/30">
                  {status}
                </span>

                {resume?.updatedAt && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-white/15" />

                    <span className="text-[10px] text-white/25">
                      Updated{" "}
                      {formatDate(
                        resume.updatedAt
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                analyzeMutation.isPending
              }
              className="w-full rounded-md bg-[#95d600] px-5 py-3 text-xs font-semibold text-[#050605] transition-colors hover:bg-[#a6ed08] disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
            >
              {analyzeMutation.isPending
                ? "Analyzing resume..."
                : hasAnalysis
                  ? "Run analysis again"
                  : "Analyze resume"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* Analysis success/error */}
        {analyzeMutation.isError && (
          <div className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.035] px-5 py-4">
            <p className="text-sm font-medium text-red-300/80">
              Resume analysis failed.
            </p>

            <p className="mt-1 text-xs leading-5 text-white/30">
              {getApiErrorMessage(
                analyzeMutation.error,
                "Please try again."
              )}
            </p>
          </div>
        )}

        {analyzeMutation.isSuccess && (
          <div className="mb-5 rounded-xl border border-[#95d600]/15 bg-[#95d600]/[0.035] px-5 py-4">
            <p className="text-xs leading-5 text-[#b6e66c]">
              Resume analysis completed
              successfully.
            </p>
          </div>
        )}

        {/* ===================================================
            RESUME CONTENT + SCORE
        =================================================== */}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          {/* Extracted resume */}
          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
                  Extracted content
                </p>

                <h2 className="mt-1.5 text-base font-semibold text-white/75">
                  Resume text
                </h2>
              </div>

              <span className="w-fit rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 text-[10px] text-white/25">
                Backend extracted
              </span>
            </div>

            <div className="mt-6 max-h-[500px] overflow-y-auto rounded-lg border border-white/[0.06] bg-[#050605] p-4 sm:max-h-[620px] sm:p-5">
              {extractedText ? (
                <p className="whitespace-pre-wrap break-words text-xs leading-6 text-white/45">
                  {extractedText}
                </p>
              ) : (
                <div className="py-10 text-center sm:py-14">
                  <p className="text-sm text-white/45">
                    No extracted text is
                    available.
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/25">
                    The backend could not
                    provide readable resume
                    content.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Score */}
          <ScorePanel
            score={score}
            loading={analysisLoading}
            hasAnalysis={hasAnalysis}
            analysisNotFound={
              analysisNotFound
            }
          />
        </section>

        {/* ===================================================
            ANALYSIS RESULTS
        =================================================== */}

        {hasAnalysis && (
          <>
            {/* Summary */}
            {summary && (
              <section className="mt-5 rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
                <SectionHeader
                  eyebrow="Analysis"
                  title="Resume overview"
                />

                <p className="mt-5 max-w-4xl text-sm leading-7 text-white/45">
                  {summary}
                </p>
              </section>
            )}

            {/* Score breakdown */}
            {scoreBreakdown.length >
              0 && (
              <section className="mt-5 rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
                <SectionHeader
                  eyebrow="Scoring"
                  title="Score breakdown"
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {scoreBreakdown.map(
                    ({
                      label,
                      value,
                    }) => (
                      <ScoreBreakdownItem
                        key={label}
                        label={label}
                        value={value}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {/* Insights */}
            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <InsightList
                eyebrow="Evidence"
                title="Strengths"
                items={strengths}
                emptyMessage="No strengths were returned by the analysis."
              />

              <InsightList
                eyebrow="Attention"
                title="Areas to improve"
                items={weaknesses}
                emptyMessage="No improvement areas were returned."
              />

              <InsightList
                eyebrow="Next steps"
                title="Recommendations"
                items={recommendations}
                emptyMessage="No recommendations were returned."
              />
            </section>
          </>
        )}

        {/* ===================================================
            NOT ANALYZED STATE
        =================================================== */}

        {!hasAnalysis &&
          !analysisLoading &&
          (analysisNotFound ||
            !analysisError) && (
            <section className="mt-5 rounded-xl border border-dashed border-white/[0.08] bg-[#080a08] p-7 text-center sm:p-8">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-[#95d600]/15 bg-[#95d600]/[0.035] text-[10px] font-semibold text-[#95d600]">
                AI
              </div>

              <h2 className="mt-4 text-base font-semibold text-white/70">
                Your resume has not been
                analyzed yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/30">
                Run SkillNexus analysis to
                generate a controlled resume
                score, structured insights, and
                actionable recommendations.
              </p>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={
                  analyzeMutation.isPending
                }
                className="mt-5 rounded-md bg-[#95d600] px-5 py-2.5 text-xs font-semibold text-[#050605] transition-colors hover:bg-[#a6ed08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzeMutation.isPending
                  ? "Analyzing..."
                  : "Analyze resume"}
              </button>
            </section>
          )}

        {/* ===================================================
            ANALYSIS ERROR
        =================================================== */}

        {analysisError &&
          !analysisNotFound &&
          !hasAnalysis && (
            <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.035] px-5 py-5">
              <p className="text-sm font-medium text-red-300/80">
                Unable to load resume
                analysis.
              </p>

              <p className="mt-1 text-xs leading-5 text-white/30">
                {analysisErrorMessage ||
                  "Please try again."}
              </p>
            </div>
          )}
      </main>
    </div>
  );
}

/* ============================================================
   SCORE PANEL
============================================================ */

function ScorePanel({
  score,
  loading,
  hasAnalysis,
  analysisNotFound,
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
        <div className="animate-pulse">
          <div className="h-2.5 w-24 rounded bg-white/[0.05]" />

          <div className="mt-6 h-24 w-32 rounded bg-white/[0.05]" />

          <div className="mt-6 h-1.5 w-full rounded bg-white/[0.04]" />

          <div className="mt-3 h-2.5 w-4/5 rounded bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080a08] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
            Resume score
          </p>

          <h2 className="mt-1.5 text-base font-semibold text-white/70">
            Overall evaluation
          </h2>
        </div>

        {hasAnalysis &&
          typeof score ===
            "number" && (
            <span className="rounded-full border border-[#95d600]/20 bg-[#95d600]/[0.05] px-2.5 py-1 text-[10px] font-medium text-[#95d600]">
              Analyzed
            </span>
          )}
      </div>

      {hasAnalysis &&
      typeof score ===
        "number" ? (
        <>
          <div className="mt-7 flex items-end gap-2">
            <span className="text-6xl font-semibold tracking-[-0.06em] text-white/90 sm:text-7xl">
              {score}
            </span>

            <span className="mb-2 text-sm text-white/25">
              / 100
            </span>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#95d600] transition-all duration-700"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    score,
                    100
                  )
                )}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/20">
              SkillNexus score
            </span>

            <span className="text-xs font-medium text-white/45">
              {getScoreLabel(score)}
            </span>
          </div>

          <p className="mt-5 text-xs leading-5 text-white/30">
            This score is returned by
            SkillNexus's resume analysis and
            reflects the structured analysis
            available for this resume.
          </p>
        </>
      ) : (
        <>
          <div className="mt-7 text-5xl font-semibold tracking-[-0.05em] text-white/15">
            —
          </div>

          <p className="mt-4 text-xs leading-5 text-white/30">
            {analysisNotFound
              ? "Analyze this resume to calculate its score."
              : "A score will appear after analysis."}
          </p>
        </>
      )}
    </div>
  );
}

/* ============================================================
   SCORE BREAKDOWN
============================================================ */

function ScoreBreakdownItem({
  label,
  value,
}) {
  const numericValue =
    Number(value);

  const safeValue =
    Number.isFinite(
      numericValue
    )
      ? Math.max(
          0,
          Math.min(
            numericValue,
            100
          )
        )
      : 0;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-xs text-white/35">
          {label}
        </span>

        <span className="shrink-0 text-sm font-semibold text-white/65">
          {Number.isFinite(
            numericValue
          )
            ? numericValue
            : "—"}
        </span>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-[#95d600]"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   INSIGHT LIST
============================================================ */

function InsightList({
  eyebrow,
  title,
  items,
  emptyMessage,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#080a08] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
        {eyebrow}
      </p>

      <h2 className="mt-1.5 text-base font-semibold text-white/70">
        {title}
      </h2>

      {items.length > 0 ? (
        <div className="mt-5 space-y-4">
          {items.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#95d600]" />

                <p className="min-w-0 break-words text-xs leading-5 text-white/40">
                  {item}
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        <p className="mt-5 text-xs leading-5 text-white/25">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  eyebrow,
  title,
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/30">
        {eyebrow}
      </p>

      <h2 className="mt-1.5 text-base font-semibold text-white/70">
        {title}
      </h2>
    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#050605]">
      <div className="animate-pulse border-b border-white/[0.07] px-5 py-8 sm:px-8 lg:px-10 lg:py-9">
        <div className="h-2.5 w-28 rounded bg-white/[0.05]" />

        <div className="mt-5 h-8 w-80 max-w-full rounded bg-white/[0.05]" />

        <div className="mt-3 h-3 w-44 rounded bg-white/[0.04]" />
      </div>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <div className="h-[500px] rounded-xl border border-white/[0.06] bg-[#080a08]" />

          <div className="h-[300px] rounded-xl border border-white/[0.06] bg-[#080a08]" />
        </div>

        <div className="mt-5 h-44 rounded-xl border border-white/[0.06] bg-[#080a08]" />

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="h-64 rounded-xl border border-white/[0.06] bg-[#080a08]" />
          <div className="h-64 rounded-xl border border-white/[0.06] bg-[#080a08]" />
          <div className="h-64 rounded-xl border border-white/[0.06] bg-[#080a08]" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ERROR
============================================================ */

function ErrorState({
  message,
  onBack,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050605] px-5">
      <div className="w-full max-w-md rounded-xl border border-red-400/15 bg-[#080a08] p-7 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-red-400/15 bg-red-400/[0.035] text-red-300/70">
          !
        </div>

        <h1 className="mt-5 text-base font-semibold text-white/70">
          Resume unavailable
        </h1>

        <p className="mt-2 text-xs leading-5 text-white/30">
          {message}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-md border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-white/45 transition-colors hover:border-white/[0.15] hover:text-white/70"
        >
          Back to resumes
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   RESUME DATA HELPERS
============================================================ */

function getExtractedText(resume) {
  return (
    resume?.extractedText ||
    resume?.text ||
    resume?.content ||
    ""
  );
}

function getOverallScore(analysis) {
  const value =
    analysis?.overallScore ??
    analysis?.score ??
    analysis?.resumeScore;

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function getScoreLabel(score) {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Developing";
  }

  if (score >= 40) {
    return "Needs work";
  }

  return "Needs improvement";
}

function getScoreBreakdown(
  analysis
) {
  const breakdown =
    analysis?.scoreBreakdown ||
    analysis?.breakdown;

  if (!breakdown) {
    return [];
  }

  if (
    typeof breakdown ===
      "object" &&
    !Array.isArray(
      breakdown
    )
  ) {
    const labelMap = {
      skills: "Skills",
      projects: "Projects",
      experience: "Experience",
      education: "Education",
      keywords: "Keywords",
      structure: "Structure",
      formatting: "Formatting",
    };

    return Object.entries(
      breakdown
    )
      .filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          Number.isFinite(
            Number(value)
          )
      )
      .map(
        ([key, value]) => ({
          label:
            labelMap[key] ||
            formatLabel(key),
          value: Number(value),
        })
      );
  }

  if (
    Array.isArray(
      breakdown
    )
  ) {
    return breakdown
      .map((item) => {
        if (
          typeof item !==
            "object" ||
          item === null
        ) {
          return null;
        }

        const label =
          item.label ||
          item.name ||
          item.category;

        const value =
          item.score ??
          item.value;

        if (
          !label ||
          !Number.isFinite(
            Number(value)
          )
        ) {
          return null;
        }

        return {
          label,
          value: Number(value),
        };
      })
      .filter(Boolean);
  }

  return [];
}

function getStringValue(
  object,
  keys
) {
  if (!object) {
    return "";
  }

  for (const key of keys) {
    const value =
      object?.[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function getStringList(
  object,
  keys
) {
  if (!object) {
    return [];
  }

  for (const key of keys) {
    const value =
      object?.[key];

    if (
      Array.isArray(value)
    ) {
      return value
        .flatMap((item) => {
          if (
            typeof item ===
            "string"
          ) {
            return item.trim();
          }

          if (
            item &&
            typeof item ===
              "object"
          ) {
            return (
              item.text ||
              item.description ||
              item.recommendation ||
              item.title ||
              ""
            );
          }

          return "";
        })
        .filter(Boolean);
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return [
        value.trim(),
      ];
    }
  }

  return [];
}

function formatLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function getFileName(resume) {
  return (
    resume?.fileName ||
    resume?.name ||
    "Resume"
  );
}

function getFileType(resume) {
  const fileType =
    resume?.fileType ||
    resume?.contentType ||
    "";

  if (
    String(fileType)
      .toLowerCase()
      .includes("pdf")
  ) {
    return "PDF";
  }

  if (
    String(fileType)
      .toLowerCase()
      .includes("word") ||
    String(fileType)
      .toLowerCase()
      .includes("docx")
  ) {
    return "DOCX";
  }

  const fileName =
    getFileName(resume);

  if (
    fileName
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    return "PDF";
  }

  if (
    fileName
      .toLowerCase()
      .endsWith(".docx")
  ) {
    return "DOCX";
  }

  return "FILE";
}

function getStatus(resume) {
  const status =
    resume?.status;

  if (!status) {
    return "Uploaded";
  }

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getApiErrorMessage(
  error,
  fallback
) {
  return (
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    error?.message ||
    fallback
  );
}

export default ResumeDetailPage;