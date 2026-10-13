import { useMutation } from "@tanstack/react-query";

import {
  askCareerCoach,
} from "../../services/careerCoach/careerCoachService";

export function useAskCareerCoach() {
  return useMutation({
    mutationFn: askCareerCoach,
  });
}