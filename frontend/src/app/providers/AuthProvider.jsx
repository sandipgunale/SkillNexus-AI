import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../../lib/authStorage";

import {
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
} from "../../services/auth/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getStoredUser());

  const isAuthenticated = Boolean(token && user);

  async function login(credentials) {
    const response = await loginRequest(credentials);

    if (!response?.success || !response?.data?.token) {
      throw new Error(
        response?.message || "Login failed"
      );
    }

    const authData = response.data;

    const authenticatedUser = {
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };

    setToken(authData.token);
    setStoredUser(authenticatedUser);

    setTokenState(authData.token);
    setUserState(authenticatedUser);

    return authData;
  }

  async function loginWithGoogle(idToken) {
    const response = await loginWithGoogleRequest(idToken);

    if (!response?.success || !response?.data?.token) {
      throw new Error(
        response?.message || "Google login failed"
      );
    }

    const authData = response.data;

    const authenticatedUser = {
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };

    setToken(authData.token);
    setStoredUser(authenticatedUser);

    setTokenState(authData.token);
    setUserState(authenticatedUser);

    return authData;
  }

  function logout() {
    clearAuthStorage();
    setTokenState(null);
    setUserState(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      loginWithGoogle,
      logout,
    }),
    [token, user, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}