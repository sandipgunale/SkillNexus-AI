import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { register } from "../../services/auth/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const { loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(formData);

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(idToken) {
    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle(idToken);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Google registration failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleGoogleError(error) {
    setGoogleLoading(false);

    setError(
      error?.response?.data?.message ||
        error?.message ||
        "Google registration failed. Please try again."
    );
  }

  const isLoading = loading || googleLoading;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050605] text-[#f4f6f3]">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#95d600]/[0.025] blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07]">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="SkillNexus AI home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#95d600]/50 bg-[#95d600]/10 text-sm font-bold text-[#95d600]">
              S
            </span>

            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              SkillNexus
              <span className="text-[#95d600]"> AI</span>
            </span>
          </Link>

          <Link
            to="/login"
            className="text-sm text-white/55 transition-colors hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Register content */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#95d600]">
              START YOUR PROFILE
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Create your account
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
              Build your SkillNexus profile and start measuring your
              technical readiness.
            </p>
          </div>

          {/* Form card */}
          <div className="border border-white/[0.08] bg-[#0a0c0a] p-6 sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-medium text-white/60"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  disabled={isLoading}
                  className="h-12 w-full rounded-md border border-white/10 bg-[#080a08] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#95d600]/50 focus:ring-1 focus:ring-[#95d600]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-white/60"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="h-12 w-full rounded-md border border-white/10 bg-[#080a08] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#95d600]/50 focus:ring-1 focus:ring-[#95d600]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-medium text-white/60"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  disabled={isLoading}
                  className="h-12 w-full rounded-md border border-white/10 bg-[#080a08] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#95d600]/50 focus:ring-1 focus:ring-[#95d600]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm leading-5 text-red-400"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-md bg-[#95d600] px-4 text-sm font-semibold text-black transition-colors hover:bg-[#a6ed08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.07]" />

              <span className="text-xs text-white/30">
                OR
              </span>

              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>

            {/* Google Sign-In */}
            <div className="relative">
              {googleLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-[#0a0c0a]/70">
                  <span className="text-sm text-white/50">
                    Creating account with Google...
                  </span>
                </div>
              )}

              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
              />
            </div>

            {/* Login link */}
            <div className="mt-7 border-t border-white/[0.07] pt-6 text-center">
              <p className="text-sm text-white/35">
                Already have an account?
              </p>

              <Link
                to="/login"
                className="mt-2 inline-block text-sm font-medium text-[#95d600] transition-colors hover:text-[#b6e66c]"
              >
                Sign in →
              </Link>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-white/30 transition-colors hover:text-white/60"
            >
              ← Back to SkillNexus AI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;