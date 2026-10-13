import apiClient from "../api/apiClient";

/* ============================================================
   CREATE PREPARATION PLAN
============================================================ */

export async function createPreparationPlan({
  title,
  description,
}) {
  const response = await apiClient.post(
    "/preparation-plans",
    {
      title,
      description,
    }
  );

  return response.data.data;
}

/* ============================================================
   GET MY PREPARATION PLANS
============================================================ */

export async function getMyPreparationPlans() {
  const response = await apiClient.get(
    "/preparation-plans"
  );

  return response.data.data;
}

/* ============================================================
   GENERATE PLAN FROM JOB MATCH
============================================================ */

export async function generatePreparationPlan({
  resumeId,
  jobDescriptionId,
}) {
  const response = await apiClient.get(
    "/preparation-plans/generate",
    {
      params: {
        resumeId,
        jobDescriptionId,
      },
    }
  );

  return response.data.data;
}

/* ============================================================
   GET SINGLE PREPARATION PLAN
============================================================ */

export async function getPreparationPlan(
  planId
) {
  const response = await apiClient.get(
    `/preparation-plans/${planId}`
  );

  return response.data.data;
}

/* ============================================================
   ACTIVATE PREPARATION PLAN
============================================================ */

export async function activatePreparationPlan(
  planId
) {
  const response = await apiClient.patch(
    `/preparation-plans/${planId}/activate`
  );

  return response.data.data;
}

/* ============================================================
   UPDATE PREPARATION ITEM STATUS
============================================================ */

export async function updatePreparationItemStatus({
  planId,
  itemId,
  status,
}) {
  const response = await apiClient.patch(
    `/preparation-plans/${planId}/items/${itemId}/status`,
    {
      status,
    }
  );

  return response.data.data;
}