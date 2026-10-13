import apiClient from "../api/apiClient";

export async function getSkillProgress() {
  const response = await apiClient.get(
    "/skill-progress"
  );

  return response.data.data;
}

export async function getReadiness() {
  const response = await apiClient.get(
    "/skill-progress/readiness"
  );

  return response.data.data;
}

export async function getSkillProgressForTechnology(
  technologyId
) {
  const response = await apiClient.get(
    `/skill-progress/${technologyId}`
  );

  return response.data.data;
}