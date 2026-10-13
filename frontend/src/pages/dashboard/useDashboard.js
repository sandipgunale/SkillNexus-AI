import {
  useCurrentUser,
  useMyResumes,
  useSkillDashboard,
  useSkillProgress,
  useReadiness,
  useMyAssessments,
  useMyInterviews,
  useMyJobs,
  useMyPreparationPlans,
} from "./useDashboardData";

export function useDashboard() {
  const currentUser = useCurrentUser();
  const resumes = useMyResumes();
  const skillDashboard = useSkillDashboard();
  const skillProgress = useSkillProgress();
  const readiness = useReadiness();
  const assessments = useMyAssessments();
  const interviews = useMyInterviews();
  const jobs = useMyJobs();
  const preparationPlans = useMyPreparationPlans();

  const queries = [
    currentUser,
    resumes,
    skillDashboard,
    skillProgress,
    readiness,
    assessments,
    interviews,
    jobs,
    preparationPlans,
  ];

  const isLoading = queries.some(
    (query) => query.isLoading
  );

  const isFetching = queries.some(
    (query) => query.isFetching
  );

  const hasSuccessfulQuery = queries.some(
    (query) => query.isSuccess
  );

  const firstError =
    queries.find((query) => query.error)?.error ?? null;

  const error =
    !hasSuccessfulQuery && firstError
      ? firstError
      : null;

  const queryErrors = {
    user: currentUser.error,
    resumes: resumes.error,
    skillDashboard: skillDashboard.error,
    skillProgress: skillProgress.error,
    readiness: readiness.error,
    assessments: assessments.error,
    interviews: interviews.error,
    jobs: jobs.error,
    preparationPlans: preparationPlans.error,
  };

  return {
    data: {
      user: currentUser.data,
      resumes: resumes.data ?? [],
      skillDashboard: skillDashboard.data,
      skillProgress: skillProgress.data ?? [],
      readiness: readiness.data,
      assessments: assessments.data ?? [],
      interviews: interviews.data ?? [],
      jobs: jobs.data ?? [],
      preparationPlans:
        preparationPlans.data ?? [],
    },

    isLoading,
    isFetching,
    error,
    queryErrors,
    queries,
  };
}