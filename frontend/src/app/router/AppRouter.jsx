import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "../../layouts/PublicLayout/PublicLayout";
import AppLayout from "../../layouts/AppLayout/AppLayout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

import LandingPage from "../../pages/landing/LandingPage";
import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import DashboardPage from "../../pages/dashboard/DashboardPage";

import ResumePage from "../../pages/resume/ResumePage";
import ResumeDetailPage from "../../pages/resume/ResumeDetailPage";

import SkillIntelligencePage from "../../pages/skills/SkillIntelligencePage";
import SkillDetailPage from "../../pages/skills/SkillDetailPage";

import AssessmentPage from "../../pages/assessments/AssessmentPage";
import AssessmentDetailPage from "../../pages/assessments/AssessmentDetailPage";
import AssessmentAttemptPage from "../../pages/assessments/AssessmentAttemptPage";
import AssessmentResultPage from "../../pages/assessments/AssessmentResultPage";

import InterviewPage from "../../pages/interviews/InterviewPage";
import InterviewDetailPage from "../../pages/interviews/InterviewDetailPage";
import InterviewQuestionsPage from "../../pages/interviews/InterviewQuestionsPage";
import InterviewResultPage from "../../pages/interviews/InterviewResultPage";

import JobPage from "../../pages/jobs/JobPage";
import JobDetailPage from "../../pages/jobs/JobDetailPage";

import PreparationPlanPage from "../../pages/preparation/PreparationPlanPage";
import PreparationPlanDetailPage from "../../pages/preparation/PreparationPlanDetailPage";

import CareerCoachPage from "../../pages/careerCoach/CareerCoachPage";

function AppRouter() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />
      </Route>

      {/* ======================================================
          PROTECTED ROUTES
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* ==================== DASHBOARD ==================== */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          {/* ====================== RESUME ===================== */}

          <Route
            path="/resume"
            element={<ResumePage />}
          />

          <Route
            path="/resume/:resumeId"
            element={<ResumeDetailPage />}
          />

          {/* ====================== SKILLS ===================== */}

          <Route
            path="/skills"
            element={<SkillIntelligencePage />}
          />

          <Route
            path="/skills/:technologyId"
            element={<SkillDetailPage />}
          />

          {/* ==================== ASSESSMENTS ================== */}

          <Route
            path="/assessments"
            element={<AssessmentPage />}
          />

          <Route
            path="/assessments/:assessmentId"
            element={<AssessmentDetailPage />}
          />

          <Route
            path="/assessments/:assessmentId/attempt/:attemptId"
            element={<AssessmentAttemptPage />}
          />

          <Route
            path="/assessments/:assessmentId/attempt/:attemptId/result"
            element={<AssessmentResultPage />}
          />

          {/* ===================== INTERVIEWS ================== */}

          <Route
            path="/interviews"
            element={<InterviewPage />}
          />

          <Route
            path="/interviews/:interviewId"
            element={<InterviewDetailPage />}
          />

          <Route
            path="/interviews/:interviewId/questions"
            element={<InterviewQuestionsPage />}
          />

          <Route
            path="/interviews/:interviewId/result"
            element={<InterviewResultPage />}
          />

          {/* ======================== JOBS ===================== */}

          <Route
            path="/jobs"
            element={<JobPage />}
          />

          <Route
            path="/jobs/:jobDescriptionId"
            element={<JobDetailPage />}
          />

          {/* ================= PREPARATION PLANS =============== */}

          <Route
            path="/preparation"
            element={<PreparationPlanPage />}
          />

          <Route
            path="/preparation/:planId"
            element={<PreparationPlanDetailPage />}
          />

          {/* ==================== CAREER COACH ================= */}

          <Route
            path="/career-coach"
            element={<CareerCoachPage />}
          />
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRouter;