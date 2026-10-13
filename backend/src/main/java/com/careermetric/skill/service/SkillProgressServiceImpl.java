package com.careermetric.skill.service;

import com.careermetric.assessment.entity.AssessmentAttempt;
import com.careermetric.assessment.repository.AssessmentAttemptRepository;
import com.careermetric.interview.entity.InterviewSession;
import com.careermetric.interview.repository.InterviewSessionRepository;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.dto.ReadinessResponse;
import com.careermetric.skill.dto.SkillProgressResponse;
import com.careermetric.skill.entity.SkillProgress;
import com.careermetric.skill.entity.Technology;
import com.careermetric.skill.repository.SkillProgressRepository;
import com.careermetric.skill.repository.TechnologyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SkillProgressServiceImpl
        implements SkillProgressService {

    private final SkillProgressRepository skillProgressRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final TechnologyRepository technologyRepository;
    private final CurrentUserService currentUserService;

    public SkillProgressServiceImpl(
            SkillProgressRepository skillProgressRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            InterviewSessionRepository interviewSessionRepository,
            TechnologyRepository technologyRepository,
            CurrentUserService currentUserService
    ) {
        this.skillProgressRepository = skillProgressRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.interviewSessionRepository = interviewSessionRepository;
        this.technologyRepository = technologyRepository;
        this.currentUserService = currentUserService;
    }

    /* ============================================================
       ALL USER SKILL PROGRESS
    ============================================================ */

    @Override
    @Transactional(readOnly = true)
    public List<SkillProgressResponse> getCurrentUserProgress() {

        Long userId = currentUserService.getCurrentUserId();

        return skillProgressRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /* ============================================================
       SINGLE TECHNOLOGY PROGRESS
       
       This method may create a SkillProgress record when
       one does not already exist, so this transaction must
       remain writable.
    ============================================================ */

    @Override
    @Transactional
    public SkillProgressResponse getCurrentUserProgressForTechnology(
            Long technologyId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        return skillProgressRepository
                .findByUserIdAndTechnologyId(
                        userId,
                        technologyId
                )
                .map(this::toResponse)
                .orElseGet(() -> recalculateProgress(technologyId));
    }

    /* ============================================================
       RECALCULATE SKILL PROGRESS
    ============================================================ */

    @Override
    public SkillProgressResponse recalculateProgress(
            Long technologyId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        Technology technology =
                technologyRepository.findById(technologyId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Technology not found"
                                )
                        );

        AssessmentAttempt assessmentAttempt =
                assessmentAttemptRepository
                        .findFirstByUserIdAndAssessmentTechnologyIdAndCompletedAtIsNotNullOrderByCompletedAtDesc(
                                userId,
                                technologyId
                        )
                        .orElse(null);

        InterviewSession interviewSession =
                interviewSessionRepository
                        .findFirstByUserIdAndTechnologyIdAndCompletedAtIsNotNullOrderByCompletedAtDesc(
                                userId,
                                technologyId
                        )
                        .orElse(null);

        Integer assessmentScore =
                assessmentAttempt != null
                        ? assessmentAttempt.getScore()
                        : null;

        Integer interviewScore =
                interviewSession != null
                        ? interviewSession.getScore()
                        : null;

        int overallScore =
                calculateOverallScore(
                        assessmentScore,
                        interviewScore
                );

        SkillProgress progress =
                skillProgressRepository
                        .findByUserIdAndTechnologyId(
                                userId,
                                technologyId
                        )
                        .orElseGet(SkillProgress::new);

        progress.setUser(
                currentUserService.getCurrentUser()
        );

        progress.setTechnology(technology);

        progress.setAssessmentScore(
                assessmentScore
        );

        progress.setInterviewScore(
                interviewScore
        );

        progress.setOverallScore(
                overallScore
        );

        SkillProgress saved =
                skillProgressRepository.save(progress);

        return toResponse(saved);
    }

    /* ============================================================
       OVERALL SCORE CALCULATION
    ============================================================ */

    private int calculateOverallScore(
            Integer assessmentScore,
            Integer interviewScore
    ) {

        if (
                assessmentScore == null &&
                interviewScore == null
        ) {
            return 0;
        }

        if (assessmentScore == null) {
            return interviewScore;
        }

        if (interviewScore == null) {
            return assessmentScore;
        }

        return (assessmentScore + interviewScore) / 2;
    }

    /* ============================================================
       ENTITY -> RESPONSE
    ============================================================ */

    private SkillProgressResponse toResponse(
            SkillProgress progress
    ) {

        return new SkillProgressResponse(
                progress.getTechnology().getId(),
                progress.getTechnology().getName(),
                progress.getAssessmentScore(),
                progress.getInterviewScore(),
                progress.getOverallScore()
        );
    }

    /* ============================================================
       CURRENT USER READINESS
    ============================================================ */

    @Override
    @Transactional(readOnly = true)
    public ReadinessResponse getCurrentUserReadiness() {

        Long userId =
                currentUserService.getCurrentUserId();

        List<SkillProgress> progressList =
                skillProgressRepository.findAllByUserId(userId);

        if (progressList.isEmpty()) {
            return new ReadinessResponse(
                    0,
                    0,
                    "NEEDS_IMPROVEMENT"
            );
        }

        int totalScore =
                progressList.stream()
                        .map(SkillProgress::getOverallScore)
                        .filter(score -> score != null)
                        .mapToInt(Integer::intValue)
                        .sum();

        long trackedSkills =
                progressList.stream()
                        .filter(progress ->
                                progress.getOverallScore() != null
                        )
                        .count();

        if (trackedSkills == 0) {
            return new ReadinessResponse(
                    0,
                    0,
                    "NEEDS_IMPROVEMENT"
            );
        }

        int readinessScore =
                (int) Math.round(
                        (double) totalScore / trackedSkills
                );

        return new ReadinessResponse(
                readinessScore,
                (int) trackedSkills,
                determineReadinessLevel(readinessScore)
        );
    }

    /* ============================================================
       READINESS LEVEL
    ============================================================ */

    private String determineReadinessLevel(
            int score
    ) {

        if (score >= 80) {
            return "HIGHLY_READY";
        }

        if (score >= 60) {
            return "INTERVIEW_READY";
        }

        if (score >= 40) {
            return "DEVELOPING";
        }

        return "NEEDS_IMPROVEMENT";
    }
}