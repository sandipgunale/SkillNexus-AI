import apiClient from "../api/apiClient";

export async function getCurrentUser() {
  const response = await apiClient.get(
    "/security/me"
  );

  return response.data.data;
}