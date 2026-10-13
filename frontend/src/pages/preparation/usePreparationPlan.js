import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activatePreparationPlan,
  createPreparationPlan,
  generatePreparationPlan,
  getMyPreparationPlans,
  getPreparationPlan,
  updatePreparationItemStatus,
} from "../../services/preparation/preparationService";

/* ============================================================
   QUERY KEYS
============================================================ */

export const PREPARATION_PLANS_QUERY_KEY = [
  "preparation-plans",
];

export function preparationPlanQueryKey(planId) {
  return [
    "preparation-plan",
    planId != null
      ? Number(planId)
      : planId,
  ];
}

/* ============================================================
   GET MY PREPARATION PLANS
============================================================ */

export function usePreparationPlans() {
  return useQuery({
    queryKey: PREPARATION_PLANS_QUERY_KEY,
    queryFn: getMyPreparationPlans,
  });
}

/* ============================================================
   GET SINGLE PREPARATION PLAN
============================================================ */

export function usePreparationPlan(planId) {
  return useQuery({
    queryKey:
      preparationPlanQueryKey(planId),

    queryFn: () =>
      getPreparationPlan(planId),

    enabled: Boolean(planId),
  });
}

/* ============================================================
   CREATE PREPARATION PLAN
============================================================ */

export function useCreatePreparationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPreparationPlan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          PREPARATION_PLANS_QUERY_KEY,
      });
    },
  });
}

/* ============================================================
   GENERATE PREPARATION PLAN
============================================================ */

export function useGeneratePreparationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      generatePreparationPlan,

    onSuccess: (data) => {
      if (data?.id != null) {
        queryClient.setQueryData(
          preparationPlanQueryKey(
            data.id
          ),
          data
        );
      }

      queryClient.invalidateQueries({
        queryKey:
          PREPARATION_PLANS_QUERY_KEY,
      });
    },
  });
}

/* ============================================================
   ACTIVATE PREPARATION PLAN
============================================================ */

export function useActivatePreparationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      activatePreparationPlan,

    onSuccess: (data, planId) => {
      /*
       * Update the exact detail-page cache.
       *
       * preparationPlanQueryKey normalizes the ID
       * to Number(), so route "2" and mutation ID 2
       * resolve to the same React Query key.
       */
      queryClient.setQueryData(
        preparationPlanQueryKey(planId),
        data
      );

      /*
       * Refresh the preparation-plan list as well,
       * because the plan status may have changed.
       */
      queryClient.invalidateQueries({
        queryKey:
          PREPARATION_PLANS_QUERY_KEY,
      });
    },
  });
}

/* ============================================================
   UPDATE PREPARATION ITEM STATUS
============================================================ */

export function useUpdatePreparationItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      updatePreparationItemStatus,

    onSuccess: (data, variables) => {
      /*
       * Update the currently opened plan immediately.
       *
       * variables.planId is numeric from the detail page,
       * while usePreparationPlan receives the route param
       * as a string. preparationPlanQueryKey normalizes
       * both to the same numeric key.
       */
      queryClient.setQueryData(
        preparationPlanQueryKey(
          variables.planId
        ),
        data
      );

      /*
       * Keep the preparation-plan listing in sync.
       */
      queryClient.invalidateQueries({
        queryKey:
          PREPARATION_PLANS_QUERY_KEY,
      });
    },
  });
}