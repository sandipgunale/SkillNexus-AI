import apiClient from "../api/apiClient";

export async function getMySkills() {
  const response = await apiClient.get("/skills");

  return response.data.data;
}

export async function getSkillDashboard() {
  const response = await apiClient.get(
    "/skills/dashboard"
  );

  return response.data.data;
}

export async function getSkill(technologyId) {
  const response = await apiClient.get(
    `/skills/${technologyId}`
  );

  return response.data.data;
}