import apiClient from "../api/apiClient";

export async function getMyInterviews() {
  const response = await apiClient.get(
    "/interviews"
  );

  return response.data.data;
}

export async function getInterview(interviewId) {
  const response = await apiClient.get(
    `/interviews/${interviewId}`
  );

  return response.data.data;
}

export async function getInterviewResult(interviewId) {
  const response = await apiClient.get(
    `/interviews/${interviewId}/result`
  );

  return response.data.data;
}