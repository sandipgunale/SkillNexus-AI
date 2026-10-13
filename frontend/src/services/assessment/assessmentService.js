import apiClient from "../api/apiClient";

export async function getMyAssessments() {
  const response = await apiClient.get(
    "/assessments"
  );

  return response.data.data;
}

export async function getAssessment(assessmentId) {
  const response = await apiClient.get(
    `/assessments/${assessmentId}`
  );

  return response.data.data;
}