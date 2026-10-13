import {
  useQuery,
} from "@tanstack/react-query";

import {
  getMySkills,
  getSkillDashboard,
  getSkill,
} from "../../services/skill/skillService";

import {
  getSkillProgress,
  getSkillProgressForTechnology,
  getReadiness,
} from "../../services/skill/skillProgressService";

/* ============================================================
   QUERY KEYS
============================================================ */

export const SKILLS_QUERY_KEY = [
  "skills",
];

export const SKILL_DASHBOARD_QUERY_KEY = [
  "skills",
  "dashboard",
];

export const SKILL_PROGRESS_QUERY_KEY = [
  "skill-progress",
];

export const READINESS_QUERY_KEY = [
  "skill-progress",
  "readiness",
];

export const skillQueryKey = (
  technologyId
) => [
  "skill",
  technologyId,
];

export const skillProgressForTechnologyQueryKey = (
  technologyId
) => [
  "skill-progress",
  technologyId,
];

/* ============================================================
   ALL USER SKILLS
============================================================ */

export function useMySkills() {
  return useQuery({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: getMySkills,
  });
}

/* ============================================================
   SKILL DASHBOARD
============================================================ */

export function useSkillDashboard() {
  return useQuery({
    queryKey:
      SKILL_DASHBOARD_QUERY_KEY,
    queryFn: getSkillDashboard,
  });
}

/* ============================================================
   OVERALL SKILL PROGRESS
============================================================ */

export function useSkillProgress() {
  return useQuery({
    queryKey:
      SKILL_PROGRESS_QUERY_KEY,
    queryFn: getSkillProgress,
  });
}

/* ============================================================
   OVERALL READINESS
============================================================ */

export function useReadiness() {
  return useQuery({
    queryKey: READINESS_QUERY_KEY,
    queryFn: getReadiness,
  });
}

/* ============================================================
   COMBINED SKILL INTELLIGENCE
============================================================ */

export function useSkillIntelligence() {
  const skills = useMySkills();

  const dashboard =
    useSkillDashboard();

  const progress =
    useSkillProgress();

  const readiness =
    useReadiness();

  const queries = [
    skills,
    dashboard,
    progress,
    readiness,
  ];

  const isLoading =
    queries.some(
      (query) => query.isLoading
    );

  const isFetching =
    queries.some(
      (query) => query.isFetching
    );

  const hasSuccessfulQuery =
    queries.some(
      (query) => query.isSuccess
    );

  const firstError =
    queries.find(
      (query) => query.error
    )?.error ?? null;

  /*
   * Only expose a global error when none of the
   * skill queries succeeded.
   *
   * This allows the page to continue rendering
   * useful skill information when one endpoint
   * temporarily fails.
   */
  const error =
    !hasSuccessfulQuery && firstError
      ? firstError
      : null;

  return {
    data: {
      skills:
        skills.data ?? [],

      dashboard:
        dashboard.data ?? null,

      progress:
        progress.data ?? [],

      readiness:
        readiness.data ?? null,
    },

    isLoading,
    isFetching,
    error,

    queryErrors: {
      skills:
        skills.error ?? null,

      dashboard:
        dashboard.error ?? null,

      progress:
        progress.error ?? null,

      readiness:
        readiness.error ?? null,
    },

    queries,
  };
}

/* ============================================================
   SINGLE TECHNOLOGY
============================================================ */

export function useSkillDetails(
  technologyId
) {
  const skill = useQuery({
    queryKey:
      skillQueryKey(technologyId),

    queryFn: () =>
      getSkill(technologyId),

    enabled:
      Boolean(technologyId),
  });

  const progress = useQuery({
    queryKey:
      skillProgressForTechnologyQueryKey(
        technologyId
      ),

    queryFn: () =>
      getSkillProgressForTechnology(
        technologyId
      ),

    enabled:
      Boolean(technologyId),
  });

  const queries = [
    skill,
    progress,
  ];

  const isLoading =
    queries.some(
      (query) => query.isLoading
    );

  const isFetching =
    queries.some(
      (query) => query.isFetching
    );

  const error =
    queries.find(
      (query) => query.error
    )?.error ?? null;

  return {
    data: {
      skill:
        skill.data ?? null,

      progress:
        progress.data ?? null,
    },

    isLoading,
    isFetching,
    error,

    queryErrors: {
      skill:
        skill.error ?? null,

      progress:
        progress.error ?? null,
    },

    queries,
  };
}