package com.careermetric.resume.service;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import com.careermetric.ai.dto.ResumeRecommendationAiResult;
import com.careermetric.ai.dto.TechnologyExtractionAiResult;
import com.careermetric.ai.service.ResumeAiService;
import com.careermetric.ai.service.ResumeRecommendationAiService;
import com.careermetric.ai.service.TechnologyExtractionAiService;
import com.careermetric.auth.entity.User;
import com.careermetric.resume.dto.ResumeAnalysisResponse;
import com.careermetric.resume.dto.ResumeDetailResponse;
import com.careermetric.resume.dto.ResumeResponse;
import com.careermetric.resume.entity.Resume;
import com.careermetric.resume.entity.ResumeAnalysis;
import com.careermetric.resume.entity.ResumeStatus;
import com.careermetric.resume.extraction.ResumeTextExtractionService;
import com.careermetric.resume.mapper.ResumeAnalysisMapper;
import com.careermetric.resume.mapper.ResumeMapper;
import com.careermetric.resume.repository.ResumeAnalysisRepository;
import com.careermetric.resume.repository.ResumeRepository;
import com.careermetric.resume.scoring.ResumeScoringResult;
import com.careermetric.resume.scoring.ResumeScoringService;
import com.careermetric.resume.storage.ResumeStorageService;
import com.careermetric.resume.validation.ResumeFileValidator;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.service.TechnologyPersistenceService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;
    private final CurrentUserService currentUserService;
    private final ResumeFileValidator resumeFileValidator;
    private final ResumeStorageService resumeStorageService;
    private final ResumeTextExtractionService resumeTextExtractionService;

    private final ResumeAiService resumeAiService;
    private final TechnologyExtractionAiService technologyExtractionAiService;
    private final ResumeRecommendationAiService resumeRecommendationAiService;

    private final ResumeScoringService resumeScoringService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeAnalysisMapper resumeAnalysisMapper;
    private final TechnologyPersistenceService technologyPersistenceService;

    public ResumeServiceImpl(
            ResumeRepository resumeRepository,
            ResumeMapper resumeMapper,
            CurrentUserService currentUserService,
            ResumeFileValidator resumeFileValidator,
            ResumeStorageService resumeStorageService,
            ResumeTextExtractionService resumeTextExtractionService,
            ResumeAiService resumeAiService,
            TechnologyExtractionAiService technologyExtractionAiService,
            ResumeRecommendationAiService resumeRecommendationAiService,
            ResumeScoringService resumeScoringService,
            ResumeAnalysisRepository resumeAnalysisRepository,
            ResumeAnalysisMapper resumeAnalysisMapper,
            TechnologyPersistenceService technologyPersistenceService
    ) {
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
        this.currentUserService = currentUserService;
        this.resumeFileValidator = resumeFileValidator;
        this.resumeStorageService = resumeStorageService;
        this.resumeTextExtractionService = resumeTextExtractionService;

        this.resumeAiService = resumeAiService;
        this.technologyExtractionAiService =
                technologyExtractionAiService;
        this.resumeRecommendationAiService =
                resumeRecommendationAiService;

        this.resumeScoringService = resumeScoringService;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.resumeAnalysisMapper = resumeAnalysisMapper;
        this.technologyPersistenceService =
                technologyPersistenceService;
    }

    @Override
    public ResumeResponse uploadResume(MultipartFile file) {

        Long userId = currentUserService.getCurrentUserId();

        resumeFileValidator.validate(file);

        String storedFilePath =
                resumeStorageService.store(file, userId);

        try {

            String extractedText =
                    resumeTextExtractionService.extractText(file);

            User user =
                    currentUserService.getCurrentUser();

            Resume resume = new Resume();

            resume.setUser(user);
            resume.setFileName(file.getOriginalFilename());
            resume.setFileType(file.getContentType());
            resume.setFilePath(storedFilePath);
            resume.setExtractedText(extractedText);
            resume.setStatus(ResumeStatus.UPLOADED);

            Resume savedResume =
                    resumeRepository.save(resume);

            return resumeMapper.toResponse(savedResume);

        } catch (RuntimeException exception) {

            resumeStorageService.delete(storedFilePath);

            throw exception;
        }
    }

    @Override
    public List<ResumeResponse> getMyResumes() {

        Long userId =
                currentUserService.getCurrentUserId();

        return resumeRepository
                .findAllByUserId(userId)
                .stream()
                .map(resumeMapper::toResponse)
                .toList();
    }

    @Override
    public ResumeDetailResponse getMyResume(Long resumeId) {

        Long userId =
                currentUserService.getCurrentUserId();

        Resume resume =
                resumeRepository
                        .findByIdAndUserId(resumeId, userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Resume not found"
                                )
                        );

        return resumeMapper.toDetailResponse(resume);
    }

    @Override
    @Transactional
    public ResumeAnalysisResponse analyzeMyResume(Long resumeId) {

        Long userId =
                currentUserService.getCurrentUserId();

        Resume resume =
                resumeRepository
                        .findByIdAndUserId(resumeId, userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Resume not found"
                                )
                        );

        if (resume.getExtractedText() == null
                || resume.getExtractedText().isBlank()) {

            throw new IllegalStateException(
                    "Resume does not contain extracted text"
            );
        }

        String resumeText =
                resume.getExtractedText();

        /*
         * Step 1:
         * Analyze the resume using AI.
         */
        ResumeAnalysisAiResult aiResult =
                resumeAiService.analyzeResume(resumeText);

        /*
         * Step 2:
         * Extract technologies explicitly supported
         * by the resume.
         */
        TechnologyExtractionAiResult technologyExtraction =
                technologyExtractionAiService.extractTechnologies(
                        resumeText
                );

        /*
         * Step 3:
         * Persist the technologies extracted from
         * the current resume analysis.
         *
         * The persistence service handles:
         * - finding existing technologies
         * - creating new technologies
         * - creating resume-technology relationships
         * - preventing stale relationships on re-analysis
         */
        technologyPersistenceService.syncExtractedTechnologies(
                resume,
                technologyExtraction
        );

        /*
         * Step 4:
         * Generate actionable recommendations using
         * the resume analysis and extracted technologies.
         */
        ResumeRecommendationAiResult recommendationAiResult =
                resumeRecommendationAiService.generateRecommendations(
                        resumeText,
                        aiResult,
                        technologyExtraction
                );

        /*
         * Step 5:
         * Calculate the deterministic resume score.
         *
         * The score is controlled by the backend and is
         * not generated by the LLM.
         */
        ResumeScoringResult scoringResult =
                resumeScoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        /*
         * Step 6:
         * Create a new analysis or update the existing
         * latest analysis for this resume.
         */
        ResumeAnalysis analysis =
                resumeAnalysisRepository
                        .findByResumeId(resumeId)
                        .orElseGet(() -> {

                            ResumeAnalysis newAnalysis =
                                    new ResumeAnalysis();

                            newAnalysis.setResume(resume);

                            return newAnalysis;
                        });

        /*
         * Step 7:
         * Map AI analysis, recommendations and
         * deterministic score into the persistence entity.
         */
        resumeAnalysisMapper.updateEntity(
                analysis,
                aiResult,
                recommendationAiResult,
                scoringResult.overallScore(),
                scoringResult.scoreBreakdown()
        );

        /*
         * Step 8:
         * Persist the latest complete analysis.
         */
        ResumeAnalysis savedAnalysis =
                resumeAnalysisRepository.save(analysis);

        /*
         * Step 9:
         * Convert the persisted entity into
         * the API response.
         */
        return resumeAnalysisMapper.toResponse(
                savedAnalysis
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysisResponse getMyResumeAnalysis(
            Long resumeId
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        Resume resume =
                resumeRepository
                        .findByIdAndUserId(resumeId, userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Resume not found"
                                )
                        );

        ResumeAnalysis analysis =
                resumeAnalysisRepository
                        .findByResumeId(resume.getId())
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Resume analysis not found"
                                )
                        );

        return resumeAnalysisMapper.toResponse(
                analysis
        );
    }

    @Override
    public void deleteMyResume(Long resumeId) {

        Long userId =
                currentUserService.getCurrentUserId();

        Resume resume =
                resumeRepository
                        .findByIdAndUserId(resumeId, userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Resume not found"
                                )
                        );

        String filePath =
                resume.getFilePath();

        resumeRepository.delete(resume);

        resumeStorageService.delete(filePath);
    }
}