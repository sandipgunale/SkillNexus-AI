import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import apiClient from "../../services/api/apiClient";

/* ============================================================
   QUERY KEYS
============================================================ */

export const ASSESSMENTS_QUERY_KEY = [
  "assessments",
];

export const assessmentQueryKey = (
  assessmentId
) => [
  "assessment",
  assessmentId,
];

export const assessmentAttemptQueryKey = (
  assessmentId,
  attemptId
) => [
  "assessment",
  assessmentId,
  "attempt",
  attemptId,
];

export const assessmentResultQueryKey = (
  assessmentId,
  attemptId
) => [
  "assessment",
  assessmentId,
  "attempt",
  attemptId,
  "result",
];

/* ============================================================
   API FUNCTIONS
============================================================ */

async function getMyAssessments() {
  const response = await apiClient.get(
    "/assessments"
  );

  return response.data.data;
}

async function getAssessment(
  assessmentId
) {
  const response = await apiClient.get(
    `/assessments/${assessmentId}`
  );

  return response.data.data;
}

/* ============================================================
   CREATE ASSESSMENT
============================================================ */

async function createAssessment({
  technologyId,
  difficulty,
}) {
  const response = await apiClient.post(
    "/assessments",
    {
      technologyId,
      difficulty,
    }
  );

  return response.data.data;
}

async function startAssessmentAttempt(
  assessmentId
) {
  const response = await apiClient.post(
    `/assessments/${assessmentId}/attempts`
  );

  return response.data.data;
}

async function submitAssessmentAnswer({
  assessmentId,
  attemptId,
  questionId,
  selectedAnswer,
}) {
  const response = await apiClient.post(
    `/assessments/${assessmentId}/attempts/${attemptId}/answers`,
    {
      questionId,
      selectedAnswer,
    }
  );

  return response.data.data;
}

async function submitAssessment({
  assessmentId,
  attemptId,
}) {
  const response = await apiClient.post(
    `/assessments/${assessmentId}/attempts/${attemptId}/submit`
  );

  return response.data.data;
}

async function getAssessmentResult({
  assessmentId,
  attemptId,
}) {
  const response = await apiClient.get(
    `/assessments/${assessmentId}/attempts/${attemptId}/result`
  );

  return response.data.data;
}

/* ============================================================
   ASSESSMENT LIST
============================================================ */

export function useAssessments() {
  return useQuery({
    queryKey: ASSESSMENTS_QUERY_KEY,
    queryFn: getMyAssessments,
  });
}

/* ============================================================
   SINGLE ASSESSMENT
============================================================ */

export function useAssessment(
  assessmentId
) {
  return useQuery({
    queryKey:
      assessmentQueryKey(
        assessmentId
      ),

    queryFn: () =>
      getAssessment(assessmentId),

    enabled:
      Boolean(assessmentId),
  });
}

/* ============================================================
   CREATE ASSESSMENT
============================================================ */

export function useCreateAssessment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createAssessment,

    onSuccess: (assessment) => {
      /*
       * Refresh the assessment list so the newly
       * generated assessment appears immediately.
       */
      queryClient.invalidateQueries({
        queryKey:
          ASSESSMENTS_QUERY_KEY,
      });

      /*
       * If the backend returned the created
       * assessment ID, refresh its detail query
       * as well.
       */
      if (assessment?.id) {
        queryClient.invalidateQueries({
          queryKey:
            assessmentQueryKey(
              assessment.id
            ),
        });
      }
    },
  });
}

/* ============================================================
   START ATTEMPT
============================================================ */

export function useStartAssessment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      startAssessmentAttempt,

    onSuccess: (attempt) => {
      if (!attempt?.assessmentId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey:
          ASSESSMENTS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          assessmentQueryKey(
            attempt.assessmentId
          ),
      });
    },
  });
}

/* ============================================================
   SUBMIT ANSWER
============================================================ */

export function useSubmitAssessmentAnswer() {
  return useMutation({
    mutationFn:
      submitAssessmentAnswer,
  });
}

/* ============================================================
   SUBMIT COMPLETE ASSESSMENT
============================================================ */

export function useSubmitAssessment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      submitAssessment,

    onSuccess: (result) => {
      if (
        !result?.assessmentId ||
        !result?.attemptId
      ) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey:
          ASSESSMENTS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          assessmentQueryKey(
            result.assessmentId
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          assessmentResultQueryKey(
            result.assessmentId,
            result.attemptId
          ),
      });

      queryClient.invalidateQueries({
        queryKey: [
          "skill-progress",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "skills",
          "dashboard",
        ],
      });
    },
  });
}

/* ============================================================
   ASSESSMENT RESULT
============================================================ */

export function useAssessmentResult(
  assessmentId,
  attemptId
) {
  return useQuery({
    queryKey:
      assessmentResultQueryKey(
        assessmentId,
        attemptId
      ),

    queryFn: () =>
      getAssessmentResult({
        assessmentId,
        attemptId,
      }),

    enabled:
      Boolean(
        assessmentId &&
        attemptId
      ),
  });
}