import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteResume,
  getMyResumes,
  uploadResume,
} from "../../services/resume/resumeService";

export const RESUMES_QUERY_KEY = ["resumes"];

export function useResumes() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: getMyResumes,
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RESUMES_QUERY_KEY,
      });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RESUMES_QUERY_KEY,
      });
    },
  });
}