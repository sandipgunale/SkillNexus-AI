import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  analyzeJobDescription,
  createJobDescription,
  getJobDescription,
  getMyJobDescriptions,
  matchResumeWithJob,
} from "../../services/job/jobService";

export const JOBS_QUERY_KEY = ["jobs"];

export function jobQueryKey(jobDescriptionId) {
  return ["job", jobDescriptionId];
}

export function jobMatchQueryKey(
  resumeId,
  jobDescriptionId
) {
  return [
    "job-match",
    resumeId,
    jobDescriptionId,
  ];
}

export function useJobs() {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: getMyJobDescriptions,
  });
}

export function useJob(jobDescriptionId) {
  return useQuery({
    queryKey: jobQueryKey(jobDescriptionId),
    queryFn: () =>
      getJobDescription(jobDescriptionId),
    enabled: Boolean(jobDescriptionId),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobDescription,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOBS_QUERY_KEY,
      });
    },
  });
}

export function useAnalyzeJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeJobDescription,

    onSuccess: (data, jobDescriptionId) => {
      queryClient.setQueryData(
        jobQueryKey(jobDescriptionId),
        data
      );

      queryClient.invalidateQueries({
        queryKey: JOBS_QUERY_KEY,
      });
    },
  });
}

export function useMatchResumeWithJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: matchResumeWithJob,

    onSuccess: (
      data,
      { resumeId, jobDescriptionId }
    ) => {
      queryClient.setQueryData(
        jobMatchQueryKey(
          resumeId,
          jobDescriptionId
        ),
        data
      );
    },
  });
}