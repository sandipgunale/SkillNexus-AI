package com.careermetric.interview.service;

import com.careermetric.ai.dto.InterviewEvaluationAiResult;
import com.careermetric.ai.dto.InterviewQuestionAi;
import com.careermetric.ai.dto.InterviewQuestionAiResult;
import com.careermetric.ai.service.InterviewAiService;
import com.careermetric.auth.entity.User;
import com.careermetric.interview.dto.CreateInterviewRequest;
import com.careermetric.interview.dto.InterviewAnswerResponse;
import com.careermetric.interview.dto.InterviewEvaluationResponse;
import com.careermetric.interview.dto.InterviewQuestionResponse;
import com.careermetric.interview.dto.InterviewResponse;
import com.careermetric.interview.dto.InterviewResultResponse;
import com.careermetric.interview.dto.SubmitInterviewAnswerRequest;
import com.careermetric.interview.entity.InterviewAnswer;
import com.careermetric.interview.entity.InterviewEvaluation;
import com.careermetric.interview.entity.InterviewQuestion;
import com.careermetric.interview.entity.InterviewSession;
import com.careermetric.interview.entity.InterviewStatus;
import com.careermetric.interview.mapper.InterviewMapper;
import com.careermetric.interview.repository.InterviewAnswerRepository;
import com.careermetric.interview.repository.InterviewEvaluationRepository;
import com.careermetric.interview.repository.InterviewQuestionRepository;
import com.careermetric.interview.repository.InterviewSessionRepository;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.entity.Technology;
import com.careermetric.skill.repository.ResumeTechnologyRepository;
import com.careermetric.skill.repository.TechnologyRepository;
import com.careermetric.skill.service.SkillProgressService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class InterviewServiceImpl
        implements InterviewService {

    private static final int DEFAULT_QUESTION_COUNT = 5;

    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;
    private final TechnologyRepository technologyRepository;
    private final ResumeTechnologyRepository resumeTechnologyRepository;
    private final InterviewAiService interviewAiService;
    private final CurrentUserService currentUserService;
    private final InterviewMapper interviewMapper;
    private final InterviewEvaluationRepository interviewEvaluationRepository;
    private final ObjectMapper objectMapper;
    private final SkillProgressService skillProgressService;

    public InterviewServiceImpl(
            InterviewSessionRepository interviewSessionRepository,
            InterviewQuestionRepository interviewQuestionRepository,
            InterviewAnswerRepository interviewAnswerRepository,
            TechnologyRepository technologyRepository,
            ResumeTechnologyRepository resumeTechnologyRepository,
            InterviewAiService interviewAiService,
            CurrentUserService currentUserService,
            InterviewMapper interviewMapper,
            InterviewEvaluationRepository interviewEvaluationRepository,
            ObjectMapper objectMapper,
            SkillProgressService skillProgressService
    ) {
        this.interviewSessionRepository =
                interviewSessionRepository;

        this.interviewQuestionRepository =
                interviewQuestionRepository;

        this.interviewAnswerRepository =
                interviewAnswerRepository;

        this.technologyRepository =
                technologyRepository;

        this.resumeTechnologyRepository =
                resumeTechnologyRepository;

        this.interviewAiService =
                interviewAiService;

        this.currentUserService =
                currentUserService;

        this.interviewMapper =
                interviewMapper;

        this.interviewEvaluationRepository =
                interviewEvaluationRepository;

        this.objectMapper =
                objectMapper;

        this.skillProgressService =
                skillProgressService;
    }

    // ============================================================
    // CREATE INTERVIEW
    // ============================================================

    @Override
    public InterviewResponse createInterview(
            CreateInterviewRequest request
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        User user =
                currentUserService.getCurrentUser();

        /*
         * Find requested technology.
         */
        Technology technology =
                technologyRepository
                        .findById(
                                request.technologyId()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Technology not found"
                                )
                        );

        /*
         * Verify that the technology exists
         * in the user's skill profile.
         */
        boolean ownsTechnology =
                resumeTechnologyRepository
                        .existsByResumeUserIdAndTechnologyId(
                                userId,
                                request.technologyId()
                        );

        if (!ownsTechnology) {

            throw new IllegalArgumentException(
                    "You can only start an interview for a technology "
                            + "present in your skill profile"
            );
        }

        /*
         * Create interview session.
         */
        InterviewSession session =
                new InterviewSession();

        session.setUser(user);

        session.setTechnology(
                technology
        );

        session.setDifficulty(
                request.difficulty()
        );

        session.setStatus(
                InterviewStatus.IN_PROGRESS
        );

        session.setQuestionCount(
                DEFAULT_QUESTION_COUNT
        );

        session =
                interviewSessionRepository.save(
                        session
                );

        /*
         * Generate AI interview questions.
         */
        InterviewQuestionAiResult aiResult =
                interviewAiService.generateQuestions(
                        technology.getName(),
                        request.difficulty().name(),
                        DEFAULT_QUESTION_COUNT
                );

        /*
         * Validate AI response.
         */
        validateGeneratedQuestions(
                aiResult,
                DEFAULT_QUESTION_COUNT
        );

        List<InterviewQuestionAi> questions =
                aiResult.questions();

        /*
         * Persist generated questions.
         */
        for (int i = 0;
             i < questions.size();
             i++) {

            InterviewQuestionAi aiQuestion =
                    questions.get(i);

            InterviewQuestion question =
                    new InterviewQuestion();

            question.setInterviewSession(
                    session
            );

            question.setQuestionText(
                    aiQuestion.questionText()
                            .trim()
            );

            question.setQuestionNumber(
                    i + 1
            );

            interviewQuestionRepository.save(
                    question
            );
        }

        return interviewMapper.toResponse(
                session
        );
    }

    // ============================================================
    // GET MY INTERVIEWS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getMyInterviews() {

        Long userId =
                currentUserService.getCurrentUserId();

        return interviewSessionRepository
                .findAllByUserId(userId)
                .stream()
                .map(interviewMapper::toResponse)
                .toList();
    }

    // ============================================================
    // GET SINGLE INTERVIEW
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getMyInterview(
            Long interviewId
    ) {

        InterviewSession session =
                getOwnedInterview(
                        interviewId
                );

        return interviewMapper.toResponse(
                session
        );
    }

    // ============================================================
    // GET INTERVIEW QUESTIONS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewQuestionResponse> getInterviewQuestions(
            Long interviewId
    ) {

        InterviewSession session =
                getOwnedInterview(
                        interviewId
                );

        return interviewQuestionRepository
                .findAllByInterviewSessionIdOrderByQuestionNumber(
                        session.getId()
                )
                .stream()
                .map(
                        interviewMapper::toQuestionResponse
                )
                .toList();
    }

    // ============================================================
    // SUBMIT ANSWER + AI EVALUATION
    // ============================================================

    @Override
    public InterviewAnswerResponse submitAnswer(
            Long interviewId,
            SubmitInterviewAnswerRequest request
    ) {

        InterviewSession session =
                getOwnedInterview(
                        interviewId
                );

        validateInterviewInProgress(
                session
        );

        /*
         * Verify that the question belongs
         * to this interview.
         */
        InterviewQuestion question =
                interviewQuestionRepository
                        .findByIdAndInterviewSessionId(
                                request.questionId(),
                                interviewId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Question does not belong to this interview"
                                )
                        );

        /*
         * Prevent duplicate answers.
         */
        if (interviewAnswerRepository
                .findByInterviewQuestionId(
                        question.getId()
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "An answer has already been submitted for this question"
            );
        }

        String answerText =
                request.answer()
                        .trim();

        if (answerText.isBlank()) {

            throw new IllegalArgumentException(
                    "Answer cannot be empty"
            );
        }

        /*
         * Persist candidate answer.
         */
        InterviewAnswer answer =
                new InterviewAnswer();

        answer.setInterviewQuestion(
                question
        );

        answer.setAnswerText(
                answerText
        );

        answer =
                interviewAnswerRepository.save(
                        answer
                );

        /*
         * Ask AI to evaluate the answer.
         */
        InterviewEvaluationAiResult aiResult =
                interviewAiService.evaluateAnswer(
                        session.getTechnology().getName(),
                        session.getDifficulty().name(),
                        question.getQuestionText(),
                        answerText
                );

        /*
         * Validate AI evaluation.
         */
        validateEvaluation(
                aiResult
        );

        /*
         * Persist evaluation.
         */
        InterviewEvaluation evaluation =
                new InterviewEvaluation();

        evaluation.setInterviewAnswer(
                answer
        );

        evaluation.setScore(
                aiResult.score()
        );

        evaluation.setFeedback(
                aiResult.feedback()
                        .trim()
        );

        evaluation.setStrengths(
                convertToJson(
                        aiResult.strengths()
                )
        );

        evaluation.setImprovements(
                convertToJson(
                        aiResult.improvements()
                )
        );

        interviewEvaluationRepository.save(
                evaluation
        );

        return new InterviewAnswerResponse(
                question.getId(),
                answerText,
                "EVALUATED"
        );
    }

    // ============================================================
    // COMPLETE INTERVIEW
    // ============================================================

    @Override
    public InterviewResultResponse completeInterview(
            Long interviewId
    ) {

        InterviewSession session =
                getOwnedInterview(
                        interviewId
                );

        validateInterviewInProgress(
                session
        );

        /*
         * Count generated questions.
         */
        long totalQuestions =
                interviewQuestionRepository
                        .countByInterviewSessionId(
                                interviewId
                        );

        /*
         * Count submitted answers.
         */
        long answeredQuestions =
                interviewAnswerRepository
                        .countByInterviewQuestionInterviewSessionId(
                                interviewId
                        );

        if (totalQuestions == 0) {

            throw new IllegalStateException(
                    "Interview has no questions"
            );
        }

        /*
         * Every question must be answered
         * before completing the interview.
         */
        if (answeredQuestions != totalQuestions) {

            throw new IllegalStateException(
                    "Please answer all interview questions before completing"
            );
        }

        /*
         * Load all answers.
         */
        List<InterviewAnswer> answers =
                interviewAnswerRepository
                        .findAllByInterviewQuestionInterviewSessionId(
                                interviewId
                        );

        if (answers.isEmpty()) {

            throw new IllegalStateException(
                    "No answers found for this interview"
            );
        }

        /*
         * Calculate final interview score
         * from the individual AI evaluations.
         */
        int totalScore = 0;

        for (InterviewAnswer answer :
                answers) {

            InterviewEvaluation evaluation =
                    interviewEvaluationRepository
                            .findByInterviewAnswerId(
                                    answer.getId()
                            )
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "Evaluation not found for question "
                                                    + answer
                                                    .getInterviewQuestion()
                                                    .getId()
                                    )
                            );

            totalScore +=
                    evaluation.getScore();
        }

        int finalScore =
                Math.round(
                        (float) totalScore
                                / answers.size()
                );

        /*
         * Update interview session.
         */
        session.setScore(
                finalScore
        );

        session.setStatus(
                InterviewStatus.COMPLETED
        );

        session.setCompletedAt(
                LocalDateTime.now()
        );

        InterviewSession completedSession =
                interviewSessionRepository.save(
                        session
                );

        /*
         * IMPORTANT:
         *
         * Push the completed interview score into
         * Skill Intelligence.
         *
         * Example:
         *
         * Assessment = 100
         * Interview   = 80
         *
         * Overall     = 90
         */
        skillProgressService.recalculateProgress(
                completedSession
                        .getTechnology()
                        .getId()
        );

        return buildResultResponse(
                completedSession,
                answers
        );
    }

    // ============================================================
    // GET INTERVIEW RESULT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewResultResponse getInterviewResult(
            Long interviewId
    ) {

        InterviewSession session =
                getOwnedInterview(
                        interviewId
                );

        if (session.getStatus()
                != InterviewStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Interview has not been completed yet"
            );
        }

        List<InterviewAnswer> answers =
                interviewAnswerRepository
                        .findAllByInterviewQuestionInterviewSessionId(
                                interviewId
                        );

        return buildResultResponse(
                session,
                answers
        );
    }

    // ============================================================
    // BUILD RESULT
    // ============================================================

    private InterviewResultResponse buildResultResponse(
            InterviewSession session,
            List<InterviewAnswer> answers
    ) {

        List<InterviewEvaluationResponse> evaluations =
                answers.stream()
                        .map(
                                this::toEvaluationResponse
                        )
                        .toList();

        return new InterviewResultResponse(
                session.getId(),
                session.getTechnology().getName(),
                session.getDifficulty().name(),
                session.getScore(),
                session.getQuestionCount(),
                answers.size(),
                session.getStartedAt(),
                session.getCompletedAt(),
                evaluations
        );
    }

    // ============================================================
    // MAP EVALUATION RESPONSE
    // ============================================================

    private InterviewEvaluationResponse toEvaluationResponse(
            InterviewAnswer answer
    ) {

        InterviewEvaluation evaluation =
                interviewEvaluationRepository
                        .findByInterviewAnswerId(
                                answer.getId()
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Evaluation not found"
                                )
                        );

        return new InterviewEvaluationResponse(
                answer.getInterviewQuestion().getId(),
                evaluation.getScore(),
                evaluation.getFeedback(),
                parseJsonList(
                        evaluation.getStrengths()
                ),
                parseJsonList(
                        evaluation.getImprovements()
                )
        );
    }

    // ============================================================
    // OWNERSHIP
    // ============================================================

    private InterviewSession getOwnedInterview(
            Long interviewId
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        return interviewSessionRepository
                .findByIdAndUserId(
                        interviewId,
                        userId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Interview not found"
                        )
                );
    }

    // ============================================================
    // STATUS VALIDATION
    // ============================================================

    private void validateInterviewInProgress(
            InterviewSession session
    ) {

        if (session.getStatus()
                != InterviewStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Interview is no longer in progress"
            );
        }
    }

    // ============================================================
    // AI QUESTION VALIDATION
    // ============================================================

    private void validateGeneratedQuestions(
            InterviewQuestionAiResult result,
            int expectedCount
    ) {

        if (result == null ||
                result.questions() == null) {

            throw new IllegalStateException(
                    "AI returned an invalid interview response"
            );
        }

        if (result.questions().size()
                != expectedCount) {

            throw new IllegalStateException(
                    "AI generated an incorrect number of questions"
            );
        }

        Set<String> uniqueQuestions =
                new HashSet<>();

        for (InterviewQuestionAi question :
                result.questions()) {

            if (question == null ||
                    question.questionText() == null ||
                    question.questionText().isBlank()) {

                throw new IllegalStateException(
                        "AI generated an empty interview question"
                );
            }

            String normalized =
                    question.questionText()
                            .trim()
                            .toLowerCase();

            if (!uniqueQuestions.add(
                    normalized
            )) {

                throw new IllegalStateException(
                        "AI generated duplicate interview questions"
                );
            }
        }
    }

    // ============================================================
    // AI EVALUATION VALIDATION
    // ============================================================

    private void validateEvaluation(
            InterviewEvaluationAiResult result
    ) {

        if (result == null) {

            throw new IllegalStateException(
                    "AI returned an invalid evaluation"
            );
        }

        if (result.score() == null ||
                result.score() < 0 ||
                result.score() > 100) {

            throw new IllegalStateException(
                    "AI returned an invalid evaluation score"
            );
        }

        if (result.feedback() == null ||
                result.feedback().isBlank()) {

            throw new IllegalStateException(
                    "AI returned empty evaluation feedback"
            );
        }

        if (result.strengths() == null) {

            throw new IllegalStateException(
                    "AI returned invalid strengths"
            );
        }

        if (result.improvements() == null) {

            throw new IllegalStateException(
                    "AI returned invalid improvements"
            );
        }

        /*
         * Validate individual list values.
         */
        validateEvaluationList(
                result.strengths(),
                "strengths"
        );

        validateEvaluationList(
                result.improvements(),
                "improvements"
        );
    }

    // ============================================================
    // EVALUATION LIST VALIDATION
    // ============================================================

    private void validateEvaluationList(
            List<String> values,
            String fieldName
    ) {

        for (String value : values) {

            if (value == null ||
                    value.isBlank()) {

                throw new IllegalStateException(
                        "AI returned an invalid "
                                + fieldName
                );
            }
        }
    }

    // ============================================================
    // JSON SERIALIZATION
    // ============================================================

    private String convertToJson(
            List<String> values
    ) {

        try {

            return objectMapper.writeValueAsString(
                    values
            );

        } catch (JsonProcessingException exception) {

            throw new IllegalStateException(
                    "Failed to store interview evaluation data",
                    exception
            );
        }
    }

    // ============================================================
    // JSON DESERIALIZATION
    // ============================================================

    private List<String> parseJsonList(
            String json
    ) {

        if (json == null ||
                json.isBlank()) {

            return List.of();
        }

        try {

            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {
                    }
            );

        } catch (JsonProcessingException exception) {

            throw new IllegalStateException(
                    "Failed to read interview evaluation data",
                    exception
            );
        }
    }
}