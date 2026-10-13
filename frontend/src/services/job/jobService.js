import apiClient from "../api/apiClient";

/* ============================================================
   CREATE JOB DESCRIPTION
============================================================ */

export async function createJobDescription({
  title,
  descriptionText,
}) {
  const response = await apiClient.post("/jobs", {
    title,
    descriptionText,
  });

  return response.data;
}

/* ============================================================
   GET MY JOB DESCRIPTIONS
============================================================ */

export async function getMyJobs() {
  const response = await apiClient.get("/jobs");

  return response.data;
}

/*
 * Alias kept for semantic clarity inside the Job Intelligence
 * module while preserving the existing Dashboard contract.
 */
export async function getMyJobDescriptions() {
  return getMyJobs();
}

/* ============================================================
   GET SINGLE JOB DESCRIPTION
============================================================ */

export async function getJobDescription(
  jobDescriptionId
) {
  const response = await apiClient.get(
    `/jobs/${jobDescriptionId}`
  );

  return response.data;
}

/* ============================================================
   ANALYZE JOB DESCRIPTION
============================================================ */

export async function analyzeJobDescription(
  jobDescriptionId
) {
  const response = await apiClient.post(
    `/jobs/${jobDescriptionId}/analyze`
  );

  return response.data;
}

/* ============================================================
   MATCH RESUME WITH JOB DESCRIPTION
============================================================ */

export async function matchResumeWithJob({
  resumeId,
  jobDescriptionId,
}) {
  const response = await apiClient.post(
    "/jobs/match",
    {
      resumeId,
      jobDescriptionId,
    }
  );

  return response.data;
}