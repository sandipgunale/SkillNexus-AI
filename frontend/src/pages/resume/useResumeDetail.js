import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  analyzeResume,
  getResume,
  getResumeAnalysis,
} from "../../services/resume/resumeService";

export const resumeDetailQueryKey = (resumeId) => [
  "resume",
  resumeId,
];

export const resumeAnalysisQueryKey = (resumeId) => [
  "resume-analysis",
  resumeId,
];

export function useResumeDetail(resumeId) {
  return useQuery({
    queryKey: resumeDetailQueryKey(resumeId),
    queryFn: () => getResume(resumeId),
    enabled: Boolean(resumeId),
  });
}

export function useResumeAnalysis(resumeId) {
  return useQuery({
    queryKey: resumeAnalysisQueryKey(resumeId),
    queryFn: () => getResumeAnalysis(resumeId),
    enabled: Boolean(resumeId),
    retry: false,
  });
}

export function useAnalyzeResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeResume,

    onSuccess: (analysis, resumeId) => {
      queryClient.setQueryData(
        resumeAnalysisQueryKey(resumeId),
        analysis
      );

      queryClient.invalidateQueries({
        queryKey: resumeDetailQueryKey(resumeId),
      });

      queryClient.invalidateQueries({
        queryKey: ["resumes"],
      });
    },
  });
}