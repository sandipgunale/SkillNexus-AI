import {
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../app/providers/AuthProvider";

import {
  markLogoutInProgress,
  clearLogoutInProgress,
} from "../../services/api/apiClient";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: "dashboard",
      },
    ],
  },

  {
    label: "Intelligence",
    items: [
      {
        label: "Resume",
        path: "/resume",
        icon: "resume",
      },
      {
        label: "Skills",
        path: "/skills",
        icon: "skills",
      },
      {
        label: "Job Intelligence",
        path: "/jobs",
        icon: "job",
      },
    ],
  },

  {
    label: "Preparation",
    items: [
      {
        label: "Assessments",
        path: "/assessments",
        icon: "assessment",
      },
      {
        label: "Interviews",
        path: "/interviews",
        icon: "interview",
      },
      {
        label: "Preparation Plan",
        path: "/preparation",
        icon: "preparation",
      },
    ],
  },

  {
    label: "AI",
    items: [
      {
        label: "Career Coach",
        path: "/career-coach",
        icon: "coach",
      },
    ],
  },
];

function AppLayout() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    logoutModalOpen,
    setLogoutModalOpen,
  ] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  function handleLogoutClick() {
    setLogoutModalOpen(true);
  }

  function handleCancelLogout() {
    setLogoutModalOpen(false);
  }

  function handleConfirmLogout() {
  /*
   * Tell the API interceptor that this is an
   * intentional logout.
   */
  markLogoutInProgress();

  setLogoutModalOpen(false);
  setMobileMenuOpen(false);

  /*
   * Clear authentication state.
   */
  logout();

  /*
   * Explicitly go to the public landing page.
   */
  navigate("/", {
    replace: true,
  });

  /*
   * Remove the flag after navigation has been
   * scheduled.
   */
  window.setTimeout(() => {
    clearLogoutInProgress();
  }, 1000);
}

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">
      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.07] bg-[#080a08] lg:flex lg:flex-col">
        {/* Brand */}

        <div className="flex h-[72px] items-center border-b border-white/[0.07] px-5">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#95d600]/50 bg-[#95d600]/10 text-sm font-bold text-[#95d600]">
              S
            </span>

            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              SkillNexus
              <span className="text-[#95d600]">
                {" "}
                AI
              </span>
            </span>
          </NavLink>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigationGroups.map(
            (group) => (
              <div
                key={group.label}
                className="mb-6 last:mb-0"
              >
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                  {group.label}
                </p>

                <div className="space-y-0.5">
                  {group.items.map(
                    (item) => (
                      <NavigationItem
                        key={item.path}
                        item={item}
                      />
                    )
                  )}
                </div>
              </div>
            )
          )}
        </nav>

        {/* User section */}

        <div className="border-t border-white/[0.07] p-3">
          <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#95d600]/10 text-xs font-semibold text-[#95d600]">
              {getInitial(user)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white/75">
                {getUserName(user)}
              </p>

              <p className="truncate text-[11px] text-white/30">
                Career Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/80"
          >
            <LogoutIcon />

            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MOBILE HEADER
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050605]/95 backdrop-blur-md lg:hidden">
        <div className="flex h-[68px] items-center justify-between px-5 sm:px-8">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#95d600]/50 bg-[#95d600]/10 text-sm font-bold text-[#95d600]">
              S
            </span>

            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              SkillNexus
              <span className="text-[#95d600]">
                {" "}
                AI
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/70 transition-colors hover:border-white/20 hover:text-white"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/70"
          />

          {/* Drawer */}

          <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-white/[0.08] bg-[#080a08]">
            {/* Drawer header */}

            <div className="flex h-[68px] items-center justify-between border-b border-white/[0.07] px-5">
              <NavLink
                to="/dashboard"
                onClick={
                  closeMobileMenu
                }
                className="flex items-center gap-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#95d600]/50 bg-[#95d600]/10 text-sm font-bold text-[#95d600]">
                  S
                </span>

                <span className="text-[15px] font-semibold">
                  SkillNexus
                  <span className="text-[#95d600]">
                    {" "}
                    AI
                  </span>
                </span>
              </NavLink>

              <button
                type="button"
                onClick={
                  closeMobileMenu
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/60 hover:text-white"
                aria-label="Close navigation"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Drawer navigation */}

            <nav className="flex-1 overflow-y-auto px-3 py-5">
              {navigationGroups.map(
                (group) => (
                  <div
                    key={group.label}
                    className="mb-6 last:mb-0"
                  >
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      {group.label}
                    </p>

                    <div className="space-y-0.5">
                      {group.items.map(
                        (item) => (
                          <NavigationItem
                            key={item.path}
                            item={item}
                            onClick={
                              closeMobileMenu
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </nav>

            {/* Mobile user */}

            <div className="border-t border-white/[0.07] p-3">
              <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#95d600]/10 text-xs font-semibold text-[#95d600]">
                  {getInitial(user)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white/75">
                    {getUserName(user)}
                  </p>

                  <p className="truncate text-[11px] text-white/30">
                    Career Profile
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleLogoutClick
                }
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/80"
              >
                <LogoutIcon />

                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================
          MAIN APPLICATION AREA
      ========================================================= */}

      <div className="min-h-screen lg:pl-[248px]">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* =========================================================
          LOGOUT CONFIRMATION MODAL
      ========================================================= */}

      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111311] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.07]">
              <LogoutIcon />
            </div>

            <h2
              id="logout-dialog-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Are you sure you want to
              log out?
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              You will need to log in again to
              access your SkillNexus AI
              dashboard.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  handleCancelLogout
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmLogout
                }
                className="rounded-lg bg-red-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NAVIGATION ITEM
========================================================= */

function NavigationItem({
  item,
  onClick,
}) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",

          isActive
            ? "bg-[#95d600]/[0.08] text-[#95d600]"
            : "text-white/45 hover:bg-white/[0.035] hover:text-white/80",
        ].join(" ")
      }
    >
      <NavigationIcon
        type={item.icon}
      />

      <span>{item.label}</span>
    </NavLink>
  );
}

/* =========================================================
   ICONS
========================================================= */

function NavigationIcon({ type }) {
  const common =
    "h-[17px] w-[17px] shrink-0";

  if (type === "dashboard") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
      </svg>
    );
  }

  if (type === "resume") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 3.5h8l4 4V20.5H6z"
        />

        <path
          strokeLinecap="round"
          d="M14 3.5v4h4"
        />

        <path
          strokeLinecap="round"
          d="M9 12h6M9 16h5"
        />
      </svg>
    );
  }

  if (type === "skills") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <path
          strokeLinecap="round"
          d="M5 19V10M12 19V5M19 19v-7"
        />

        <circle
          cx="5"
          cy="8"
          r="2"
        />

        <circle
          cx="12"
          cy="3"
          r="2"
        />

        <circle
          cx="19"
          cy="10"
          r="2"
        />
      </svg>
    );
  }

  if (type === "job") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
        />

        <path
          strokeLinecap="round"
          d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"
        />

        <path
          strokeLinecap="round"
          d="M3 12h18"
        />
      </svg>
    );
  }

  if (type === "assessment") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <path
          strokeLinecap="round"
          d="M6 3.5h12v17H6z"
        />

        <path
          strokeLinecap="round"
          d="M9 8h6M9 12h6M9 16h4"
        />
      </svg>
    );
  }

  if (type === "interview") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"
        />

        <path
          strokeLinecap="round"
          d="M8 8h8M8 12h5"
        />
      </svg>
    );
  }

  if (type === "preparation") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={common}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5z"
        />

        <path
          strokeLinecap="round"
          d="M8 8h8M8 12h8M8 16h5"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={common}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5a6 6 0 0 0-6 6v3.5l-2 3h16l-2-3V9.5a6 6 0 0 0-6-6Z"
      />

      <path
        strokeLinecap="round"
        d="M9.5 19a2.7 2.7 0 0 0 5 0"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-[17px] w-[17px] shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H10"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 8l4 4-4 4"
      />

      <path
        strokeLinecap="round"
        d="M9 12h8"
      />
    </svg>
  );
}

/* =========================================================
   USER HELPERS
========================================================= */

function getUserName(user) {
  if (!user) {
    return "User";
  }

  return (
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "User"
  );
}

function getInitial(user) {
  const name = getUserName(user);

  return name
    .charAt(0)
    .toUpperCase();
}

export default AppLayout;