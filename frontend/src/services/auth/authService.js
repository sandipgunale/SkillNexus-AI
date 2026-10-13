import apiClient from "../api/apiClient";

export async function login(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function register(userData) {
  const response = await apiClient.post("/auth/register", userData);
  return response.data;
}

export async function loginWithGoogle(idToken) {
  const response = await apiClient.post("/auth/google", {
    idToken,
  });

  return response.data;
}