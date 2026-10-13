import apiClient from "../api/apiClient";

export async function getMyResumes() {
  const response = await apiClient.get("/resumes");

  return response.data.data;
}

export async function getResume(resumeId) {
  const response = await apiClient.get(`/resumes/${resumeId}`);

  return response.data.data;
}

export async function getResumeAnalysis(resumeId) {
  const response = await apiClient.get(
    `/resumes/${resumeId}/analysis`
  );

  return response.data.data;
}

export async function uploadResume(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post(
    "/resumes",
    formData
  );

  return response.data.data;
}

export async function deleteResume(resumeId) {
  const response = await apiClient.delete(
    `/resumes/${resumeId}`
  );

  return response.data;
}

export async function analyzeResume(resumeId) {
  const response = await apiClient.post(
    `/resumes/${resumeId}/analyze`
  );

  return response.data.data;
}