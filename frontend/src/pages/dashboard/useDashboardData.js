import { useQuery } from "@tanstack/react-query";

import { getMyResumes } from "../../services/resume/resumeService";
import {
  getSkillDashboard,
} from "../../services/skill/skillService";
import {
  getSkillProgress,
  getReadiness,
} from "../../services/skill/skillProgressService";
import {
  getMyAssessments,
} from "../../services/assessment/assessmentService";
import {
  getMyInterviews,
} from "../../services/interview/interviewService";
import {
  getMyJobs,
} from "../../services/job/jobService";
import {
  getMyPreparationPlans,
} from "../../services/preparation/preparationService";
import {
  getCurrentUser,
} from "../../services/user/userService";

/* ============================================================
   CURRENT USER
============================================================ */

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
}

/* ============================================================
   RESUMES
============================================================ */

export function useMyResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: getMyResumes,
  });
}

/* ============================================================
   SKILL DASHBOARD
============================================================ */

export function useSkillDashboard() {
  return useQuery({
    queryKey: ["skills", "dashboard"],
    queryFn: getSkillDashboard,
  });
}

/* ============================================================
   SKILL PROGRESS
============================================================ */

export function useSkillProgress() {
  return useQuery({
    queryKey: ["skill-progress"],
    queryFn: getSkillProgress,
  });
}

/* ============================================================
   READINESS
============================================================ */

export function useReadiness() {
  return useQuery({
    queryKey: ["skill-progress", "readiness"],
    queryFn: getReadiness,
  });
}

/* ============================================================
   ASSESSMENTS
============================================================ */

export function useMyAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: getMyAssessments,
  });
}

/* ============================================================
   INTERVIEWS
============================================================ */

export function useMyInterviews() {
  return useQuery({
    queryKey: ["interviews"],
    queryFn: getMyInterviews,
  });
}

/* ============================================================
   JOBS
============================================================ */

export function useMyJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: getMyJobs,
  });
}

/* ============================================================
   PREPARATION PLANS
============================================================ */

export function useMyPreparationPlans() {
  return useQuery({
    queryKey: ["preparation-plans"],
    queryFn: getMyPreparationPlans,
  });
}