const TOKEN_KEY =
  "careermetric_access_token";

const USER_KEY =
  "careermetric_user";

export function getToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

export function setToken(token) {
  localStorage.setItem(
    TOKEN_KEY,
    token
  );
}

export function getStoredUser() {
  const storedUser =
    localStorage.getItem(
      USER_KEY
    );

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser
    );
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export function clearAuthStorage() {
  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}