import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/api/apiClient";

/* ============================================================
   QUERY KEYS
============================================================ */

export const INTERVIEWS_QUERY_KEY = ["interviews"];

export function interviewQueryKey(interviewId) {
  return ["interview", interviewId];
}

export function interviewQuestionsQueryKey(interviewId) {
  return ["interview", interviewId, "questions"];
}

export function interviewResultQueryKey(interviewId) {
  return ["interview", interviewId, "result"];
}

/* ============================================================
   API FUNCTIONS
============================================================ */

export async function getMyInterviews() {
  const response = await apiClient.get("/interviews");

  return response.data.data;
}

export async function getInterview(interviewId) {
  const response = await apiClient.get(
    `/interviews/${interviewId}`
  );

  return response.data.data;
}

export async function getInterviewQuestions(interviewId) {
  const response = await apiClient.get(
    `/interviews/${interviewId}/questions`
  );

  return response.data.data;
}

export async function createInterview({
  technologyId,
  difficulty,
}) {
  const response = await apiClient.post(
    "/interviews",
    {
      technologyId,
      difficulty,
    }
  );

  return response.data.data;
}

export async function submitInterviewAnswer({
  interviewId,
  questionId,
  answer,
}) {
  const response = await apiClient.post(
    `/interviews/${interviewId}/answers`,
    {
      questionId,
      answer,
    }
  );

  return response.data.data;
}

export async function completeInterview(interviewId) {
  const response = await apiClient.post(
    `/interviews/${interviewId}/complete`
  );

  return response.data.data;
}

export async function getInterviewResult(interviewId) {
  const response = await apiClient.get(
    `/interviews/${interviewId}/result`
  );

  return response.data.data;
}

/* ============================================================
   QUERIES
============================================================ */

export function useInterviews() {
  return useQuery({
    queryKey: INTERVIEWS_QUERY_KEY,
    queryFn: getMyInterviews,
  });
}

export function useInterview(interviewId) {
  return useQuery({
    queryKey: interviewQueryKey(interviewId),
    queryFn: () => getInterview(interviewId),
    enabled: Boolean(interviewId),
  });
}

export function useInterviewQuestions(interviewId) {
  return useQuery({
    queryKey: interviewQuestionsQueryKey(interviewId),
    queryFn: () => getInterviewQuestions(interviewId),
    enabled: Boolean(interviewId),
  });
}

export function useInterviewResult(interviewId) {
  return useQuery({
    queryKey: interviewResultQueryKey(interviewId),
    queryFn: () => getInterviewResult(interviewId),
    enabled: Boolean(interviewId),
  });
}

/* ============================================================
   MUTATIONS
============================================================ */

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInterview,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INTERVIEWS_QUERY_KEY,
      });
    },
  });
}

export function useSubmitInterviewAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitInterviewAnswer,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: interviewQueryKey(
          variables.interviewId
        ),
      });

      queryClient.invalidateQueries({
        queryKey: interviewQuestionsQueryKey(
          variables.interviewId
        ),
      });
    },
  });
}

export function useCompleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeInterview,

    onSuccess: (_, interviewId) => {
      queryClient.invalidateQueries({
        queryKey: INTERVIEWS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: interviewQueryKey(
          interviewId
        ),
      });

      queryClient.invalidateQueries({
        queryKey: interviewResultQueryKey(
          interviewId
        ),
      });

      /*
       * Completing an interview updates Skill Intelligence
       * on the backend.
       *
       * Refresh related skill/progress data so the updated
       * interview score can appear there.
       */
      queryClient.invalidateQueries({
        queryKey: ["skill-progress"],
      });

      queryClient.invalidateQueries({
        queryKey: ["skills", "dashboard"],
      });
    },
  });
}