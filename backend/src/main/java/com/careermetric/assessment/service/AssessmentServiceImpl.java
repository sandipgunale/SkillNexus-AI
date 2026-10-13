package com.careermetric.assessment.service;

import com.careermetric.ai.dto.AssessmentQuestionAi;
import com.careermetric.ai.dto.AssessmentQuestionAiResult;
import com.careermetric.ai.service.AssessmentQuestionAiService;
import com.careermetric.assessment.dto.AssessmentAttemptResponse;
import com.careermetric.assessment.dto.AssessmentDetailResponse;
import com.careermetric.assessment.dto.AssessmentResponse;
import com.careermetric.assessment.dto.AssessmentResultResponse;
import com.careermetric.assessment.dto.CreateAssessmentRequest;
import com.careermetric.assessment.dto.SubmitAnswerRequest;
import com.careermetric.assessment.entity.Answer;
import com.careermetric.assessment.entity.Assessment;
import com.careermetric.assessment.entity.AssessmentAttempt;
import com.careermetric.assessment.entity.AssessmentStatus;
import com.careermetric.assessment.entity.AttemptStatus;
import com.careermetric.assessment.entity.Question;
import com.careermetric.assessment.entity.QuestionType;
import com.careermetric.assessment.mapper.AssessmentAttemptMapper;
import com.careermetric.assessment.mapper.AssessmentMapper;
import com.careermetric.assessment.repository.AnswerRepository;
import com.careermetric.assessment.repository.AssessmentAttemptRepository;
import com.careermetric.assessment.repository.AssessmentRepository;
import com.careermetric.assessment.repository.QuestionRepository;
import com.careermetric.auth.entity.User;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.entity.Technology;
import com.careermetric.skill.repository.ResumeTechnologyRepository;
import com.careermetric.skill.repository.TechnologyRepository;
import com.careermetric.skill.service.SkillProgressService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AssessmentServiceImpl
        implements AssessmentService {

    private static final int DEFAULT_QUESTION_COUNT = 5;

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final TechnologyRepository technologyRepository;
    private final ResumeTechnologyRepository resumeTechnologyRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AnswerRepository answerRepository;
    private final CurrentUserService currentUserService;
    private final AssessmentMapper assessmentMapper;
    private final AssessmentAttemptMapper assessmentAttemptMapper;
    private final AssessmentQuestionAiService
            assessmentQuestionAiService;
    private final SkillProgressService skillProgressService;

    public AssessmentServiceImpl(
            AssessmentRepository assessmentRepository,
            QuestionRepository questionRepository,
            TechnologyRepository technologyRepository,
            ResumeTechnologyRepository resumeTechnologyRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AnswerRepository answerRepository,
            CurrentUserService currentUserService,
            AssessmentMapper assessmentMapper,
            AssessmentAttemptMapper assessmentAttemptMapper,
            AssessmentQuestionAiService assessmentQuestionAiService,
            SkillProgressService skillProgressService
    ) {
        this.assessmentRepository =
                assessmentRepository;

        this.questionRepository =
                questionRepository;

        this.technologyRepository =
                technologyRepository;

        this.resumeTechnologyRepository =
                resumeTechnologyRepository;

        this.assessmentAttemptRepository =
                assessmentAttemptRepository;

        this.answerRepository =
                answerRepository;

        this.currentUserService =
                currentUserService;

        this.assessmentMapper =
                assessmentMapper;

        this.assessmentAttemptMapper =
                assessmentAttemptMapper;

        this.assessmentQuestionAiService =
                assessmentQuestionAiService;

        this.skillProgressService =
                skillProgressService;
    }

    // ============================================================
    // CREATE ASSESSMENT
    // ============================================================

    @Override
    @Transactional
    public AssessmentResponse createAssessment(
            CreateAssessmentRequest request
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        User user =
                currentUserService.getCurrentUser();

        /*
         * Step 1:
         * Find the requested technology.
         */
        Technology technology =
                technologyRepository
                        .findById(request.technologyId())
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Technology not found"
                                )
                        );

        /*
         * Step 2:
         * Verify that this technology is actually
         * associated with one of the user's resumes.
         */
        boolean ownsTechnology =
                resumeTechnologyRepository
                        .existsByResumeUserIdAndTechnologyId(
                                userId,
                                technology.getId()
                        );

        if (!ownsTechnology) {

            throw new IllegalArgumentException(
                    "Technology is not associated with your resume"
            );
        }

        /*
         * Step 3:
         * Create the assessment.
         */
        Assessment assessment =
                new Assessment();

        assessment.setUser(user);

        assessment.setTechnology(
                technology
        );

        assessment.setDifficulty(
                request.difficulty()
        );

        assessment.setStatus(
                AssessmentStatus.CREATED
        );

        assessment.setQuestionCount(
                DEFAULT_QUESTION_COUNT
        );

        Assessment savedAssessment =
                assessmentRepository.save(
                        assessment
                );

        /*
         * Step 4:
         * Generate assessment questions using AI.
         */
        AssessmentQuestionAiResult aiResult =
                assessmentQuestionAiService.generateQuestions(
                        technology.getName(),
                        request.difficulty().name(),
                        DEFAULT_QUESTION_COUNT
                );

        /*
         * Step 5:
         * Validate AI result before touching
         * the Question table.
         */
        validateAiResult(
                aiResult,
                DEFAULT_QUESTION_COUNT
        );

        /*
         * Step 6:
         * Convert AI questions into database entities.
         */
        List<Question> questions =
                aiResult.questions()
                        .stream()
                        .map(question ->
                                toQuestionEntity(
                                        savedAssessment,
                                        question
                                )
                        )
                        .toList();

        /*
         * Step 7:
         * Persist all questions.
         */
        questionRepository.saveAll(
                questions
        );

        /*
         * Step 8:
         * Mark assessment as ready.
         */
        savedAssessment.setStatus(
                AssessmentStatus.READY
        );

        Assessment readyAssessment =
                assessmentRepository.save(
                        savedAssessment
                );

        return assessmentMapper.toResponse(
                readyAssessment
        );
    }

    // ============================================================
    // GET MY ASSESSMENTS
    // ============================================================

    @Override
    @Transactional
    public List<AssessmentResponse> getMyAssessments() {

        Long userId =
                currentUserService.getCurrentUserId();

        return assessmentRepository
                .findAllByUserId(userId)
                .stream()
                .map(assessmentMapper::toResponse)
                .toList();
    }

    // ============================================================
    // GET ASSESSMENT DETAILS
    // ============================================================

    @Override
    @Transactional
    public AssessmentDetailResponse getMyAssessment(
            Long assessmentId
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        Assessment assessment =
                assessmentRepository
                        .findByIdAndUserId(
                                assessmentId,
                                userId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Assessment not found"
                                )
                        );

        List<Question> questions =
                questionRepository
                        .findAllByAssessmentId(
                                assessmentId
                        );

        return assessmentMapper.toDetailResponse(
                assessment,
                questions
        );
    }

    // ============================================================
    // START ATTEMPT
    // ============================================================

    @Override
    @Transactional
    public AssessmentAttemptResponse startAttempt(
            Long assessmentId
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        /*
         * Find assessment and verify ownership.
         */
        Assessment assessment =
                assessmentRepository
                        .findByIdAndUserId(
                                assessmentId,
                                userId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Assessment not found"
                                )
                        );

        /*
         * Candidate can only start a ready assessment.
         */
        if (assessment.getStatus()
                != AssessmentStatus.READY) {

            throw new IllegalStateException(
                    "Assessment is not ready"
            );
        }

        /*
         * Verify that questions actually exist.
         */
        long questionCount =
                questionRepository
                        .countByAssessmentId(
                                assessmentId
                        );

        if (questionCount == 0) {

            throw new IllegalStateException(
                    "Assessment has no questions"
            );
        }

        /*
         * Create a new attempt.
         */
        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setAssessment(
                assessment
        );

        attempt.setUser(
                currentUserService.getCurrentUser()
        );

        attempt.setStatus(
                AttemptStatus.IN_PROGRESS
        );

        attempt.setTotalQuestions(
                (int) questionCount
        );

        AssessmentAttempt savedAttempt =
                assessmentAttemptRepository.save(
                        attempt
                );

        return assessmentAttemptMapper.toResponse(
                savedAttempt
        );
    }

    // ============================================================
    // SUBMIT INDIVIDUAL ANSWER
    // ============================================================

    @Override
    @Transactional
    public AssessmentAttemptResponse submitAnswer(
            Long assessmentId,
            Long attemptId,
            SubmitAnswerRequest request
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        /*
         * Step 1:
         * Find the attempt and verify:
         *
         * - attempt belongs to current user
         * - attempt belongs to requested assessment
         */
        AssessmentAttempt attempt =
                assessmentAttemptRepository
                        .findByIdAndAssessmentIdAndUserId(
                                attemptId,
                                assessmentId,
                                userId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Assessment attempt not found"
                                )
                        );

        /*
         * Step 2:
         * Candidate cannot answer after completion.
         */
        if (attempt.getStatus()
                != AttemptStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Assessment attempt is already completed"
            );
        }

        /*
         * Step 3:
         * Verify that question belongs
         * to this assessment.
         */
        Question question =
                questionRepository
                        .findByIdAndAssessmentId(
                                request.questionId(),
                                assessmentId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Question not found"
                                )
                        );

        /*
         * Step 4:
         * Prevent duplicate answers.
         */
        if (answerRepository.existsByAttemptIdAndQuestionId(
                attemptId,
                question.getId()
        )) {

            throw new IllegalStateException(
                    "Answer already submitted for this question"
            );
        }

        /*
         * Step 5:
         * Deterministic evaluation.
         *
         * No AI is required here.
         */
        boolean correct =
                question.getCorrectAnswer()
                        .equals(
                                request.selectedAnswer()
                        );

        /*
         * Step 6:
         * Create answer record.
         */
        Answer answer =
                new Answer();

        answer.setAttempt(
                attempt
        );

        answer.setQuestion(
                question
        );

        answer.setSelectedAnswer(
                request.selectedAnswer()
        );

        answer.setCorrect(
                correct
        );

        answerRepository.save(
                answer
        );

        return assessmentAttemptMapper.toResponse(
                attempt
        );
    }

    // ============================================================
    // SUBMIT COMPLETE ASSESSMENT
    // ============================================================

    @Override
    @Transactional
    public AssessmentResultResponse submitAssessment(
            Long assessmentId,
            Long attemptId
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        /*
         * Step 1:
         * Find the attempt belonging to:
         *
         * - current user
         * - requested assessment
         */
        AssessmentAttempt attempt =
                assessmentAttemptRepository
                        .findByIdAndAssessmentIdAndUserId(
                                attemptId,
                                assessmentId,
                                userId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Assessment attempt not found"
                                )
                        );

        /*
         * Step 2:
         * Prevent submitting an already
         * completed attempt.
         */
        if (attempt.getStatus()
                != AttemptStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Assessment attempt is already completed"
            );
        }

        /*
         * Step 3:
         * Get all questions.
         */
        List<Question> questions =
                questionRepository
                        .findAllByAssessmentId(
                                assessmentId
                        );

        if (questions.isEmpty()) {

            throw new IllegalStateException(
                    "Assessment has no questions"
            );
        }

        /*
         * Step 4:
         * Get all answers submitted
         * during this attempt.
         */
        List<Answer> answers =
                answerRepository
                        .findAllByAttemptId(
                                attemptId
                        );

        /*
         * Step 5:
         * Count correct answers.
         */
        int correctAnswers =
                (int) answers.stream()
                        .filter(Answer::getCorrect)
                        .count();

        /*
         * Step 6:
         * Calculate score.
         *
         * Example:
         *
         * 4 / 5 = 80
         */
        int totalQuestions =
                questions.size();

        int score =
                Math.round(
                        ((float) correctAnswers
                                / totalQuestions)
                                * 100
                );

        /*
         * Step 7:
         * Mark attempt as completed.
         */
        attempt.setStatus(
                AttemptStatus.COMPLETED
        );

        attempt.setScore(
                score
        );

        attempt.setCorrectAnswers(
                correctAnswers
        );

        attempt.setTotalQuestions(
                totalQuestions
        );

        attempt.setCompletedAt(
                LocalDateTime.now()
        );

        AssessmentAttempt completedAttempt =
                assessmentAttemptRepository.save(
                        attempt
                );

        /*
         * Step 8:
         * Recalculate Skill Intelligence.
         *
         * The completed assessment score becomes
         * part of the technology's skill progress.
         */
        skillProgressService.recalculateProgress(
                completedAttempt
                        .getAssessment()
                        .getTechnology()
                        .getId()
        );

        /*
         * Step 9:
         * Return result.
         */
        return toResultResponse(
                completedAttempt,
                answers.size()
        );
    }

    // ============================================================
    // GET ASSESSMENT RESULT
    // ============================================================

    @Override
    @Transactional
    public AssessmentResultResponse getAssessmentResult(
            Long assessmentId,
            Long attemptId
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        /*
         * Find the attempt and verify ownership.
         */
        AssessmentAttempt attempt =
                assessmentAttemptRepository
                        .findByIdAndAssessmentIdAndUserId(
                                attemptId,
                                assessmentId,
                                userId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Assessment attempt not found"
                                )
                        );

        /*
         * Result is available only after completion.
         */
        if (attempt.getStatus()
                != AttemptStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Assessment has not been completed"
            );
        }

        /*
         * Count answered questions.
         */
        int answeredQuestions =
                answerRepository
                        .findAllByAttemptId(
                                attemptId
                        )
                        .size();

        return toResultResponse(
                attempt,
                answeredQuestions
        );
    }

    // ============================================================
    // AI RESULT VALIDATION
    // ============================================================

    private void validateAiResult(
            AssessmentQuestionAiResult aiResult,
            int expectedQuestionCount
    ) {

        if (aiResult == null
                || aiResult.questions() == null) {

            throw new IllegalStateException(
                    "AI did not return assessment questions"
            );
        }

        if (aiResult.questions().size()
                != expectedQuestionCount) {

            throw new IllegalStateException(
                    "AI returned an invalid number of questions"
            );
        }

        Set<String> questionTexts =
                new HashSet<>();

        for (AssessmentQuestionAi question
                : aiResult.questions()) {

            if (question == null) {

                throw new IllegalStateException(
                        "AI returned an invalid question"
                );
            }

            if (question.questionText() == null
                    || question.questionText().isBlank()) {

                throw new IllegalStateException(
                        "AI returned a question without text"
                );
            }

            /*
             * Currently SkillNexus AI supports
             * MCQ assessments only.
             */
            if (!"MCQ".equalsIgnoreCase(
                    question.questionType()
            )) {

                throw new IllegalStateException(
                        "Only MCQ questions are supported"
                );
            }

            /*
             * Every MCQ must have exactly
             * four options.
             */
            if (question.options() == null
                    || question.options().size() != 4) {

                throw new IllegalStateException(
                        "Each question must contain exactly four options"
                );
            }

            /*
             * Validate individual options.
             */
            for (String option : question.options()) {

                if (option == null
                        || option.isBlank()) {

                    throw new IllegalStateException(
                            "Question options cannot be empty"
                    );
                }
            }

            /*
             * Validate correct answer.
             */
            if (question.correctAnswer() == null
                    || question.correctAnswer().isBlank()) {

                throw new IllegalStateException(
                        "Question must contain a correct answer"
                );
            }

            /*
             * Correct answer must exactly match
             * one of the four options.
             */
            boolean correctAnswerExists =
                    question.options()
                            .stream()
                            .anyMatch(option ->
                                    option.equals(
                                            question.correctAnswer()
                                    )
                            );

            if (!correctAnswerExists) {

                throw new IllegalStateException(
                        "Correct answer must match one of the options"
                );
            }

            /*
             * Explanation is required.
             */
            if (question.explanation() == null
                    || question.explanation().isBlank()) {

                throw new IllegalStateException(
                        "Question explanation cannot be empty"
                );
            }

            /*
             * Prevent duplicate questions.
             */
            String normalizedQuestion =
                    question.questionText()
                            .trim()
                            .toLowerCase();

            if (!questionTexts.add(
                    normalizedQuestion
            )) {

                throw new IllegalStateException(
                        "AI generated duplicate questions"
                );
            }
        }
    }

    // ============================================================
    // AI QUESTION → QUESTION ENTITY
    // ============================================================

    private Question toQuestionEntity(
            Assessment assessment,
            AssessmentQuestionAi aiQuestion
    ) {

        Question question =
                new Question();

        question.setAssessment(
                assessment
        );

        question.setQuestionText(
                aiQuestion.questionText().trim()
        );

        question.setQuestionType(
                QuestionType.MCQ
        );

        question.setOptions(
                aiQuestion.options()
        );

        question.setCorrectAnswer(
                aiQuestion.correctAnswer()
        );

        question.setExplanation(
                aiQuestion.explanation()
        );

        return question;
    }

    // ============================================================
    // RESULT RESPONSE MAPPER
    // ============================================================

    private AssessmentResultResponse toResultResponse(
            AssessmentAttempt attempt,
            int answeredQuestions
    ) {

        return new AssessmentResultResponse(
                attempt.getId(),
                attempt.getAssessment().getId(),
                attempt.getAssessment()
                        .getTechnology()
                        .getName(),
                attempt.getAssessment()
                        .getDifficulty()
                        .name(),
                attempt.getScore(),
                attempt.getCorrectAnswers(),
                attempt.getTotalQuestions(),
                answeredQuestions,
                attempt.getStartedAt(),
                attempt.getCompletedAt()
        );
    }
}