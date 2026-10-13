package com.careermetric.job.service;

import com.careermetric.ai.service.EmbeddingService;
import com.careermetric.job.dto.JobMatchRequest;
import com.careermetric.job.dto.JobMatchResponse;
import com.careermetric.job.dto.SkillGap;
import com.careermetric.job.entity.JobDescription;
import com.careermetric.job.entity.JobRequirement;
import com.careermetric.job.entity.JobRequirementType;
import com.careermetric.job.repository.JobDescriptionRepository;
import com.careermetric.job.repository.JobRequirementRepository;
import com.careermetric.resume.entity.Resume;
import com.careermetric.resume.repository.ResumeRepository;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.entity.ResumeTechnology;
import com.careermetric.skill.repository.ResumeTechnologyRepository;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobMatchingServiceImpl implements JobMatchingService {

    private static final int RESUME_CHUNK_SIZE = 1000;

    private static final double SEMANTIC_MATCH_THRESHOLD = 0.70;

    private final JobDescriptionRepository jobDescriptionRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeTechnologyRepository resumeTechnologyRepository;
    private final CurrentUserService currentUserService;
    private final EmbeddingService embeddingService;
    private final SkillGapIntelligenceService skillGapIntelligenceService;

    public JobMatchingServiceImpl(
            JobDescriptionRepository jobDescriptionRepository,
            JobRequirementRepository jobRequirementRepository,
            ResumeRepository resumeRepository,
            ResumeTechnologyRepository resumeTechnologyRepository,
            CurrentUserService currentUserService,
            EmbeddingService embeddingService,
            SkillGapIntelligenceService skillGapIntelligenceService
    ) {
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.resumeRepository = resumeRepository;
        this.resumeTechnologyRepository = resumeTechnologyRepository;
        this.currentUserService = currentUserService;
        this.embeddingService = embeddingService;
        this.skillGapIntelligenceService =
                skillGapIntelligenceService;
    }

    @Override
    public JobMatchResponse matchResumeWithJob(
            JobMatchRequest request
    ) {

        Long userId =
                currentUserService.getCurrentUserId();

        // ---------------------------------------------------------
        // 1. Verify resume ownership
        // ---------------------------------------------------------

        Resume resume =
                resumeRepository
                        .findByIdAndUserId(
                                request.resumeId(),
                                userId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Resume not found"
                                )
                        );

        // ---------------------------------------------------------
        // 2. Verify job description ownership
        // ---------------------------------------------------------

        JobDescription jobDescription =
                jobDescriptionRepository
                        .findByIdAndUserId(
                                request.jobDescriptionId(),
                                userId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Job description not found"
                                )
                        );

        // ---------------------------------------------------------
        // 3. Get analyzed requirements
        // ---------------------------------------------------------

        List<JobRequirement> requirements =
                jobRequirementRepository
                        .findAllByJobDescriptionId(
                                jobDescription.getId()
                        );

        if (requirements.isEmpty()) {
            throw new IllegalStateException(
                    "Job description has not been analyzed yet"
            );
        }

        // ---------------------------------------------------------
        // 4. Get resume technologies
        // ---------------------------------------------------------

        List<ResumeTechnology> resumeTechnologies =
                resumeTechnologyRepository
                        .findAllByResumeId(
                                resume.getId()
                        );

        Set<String> resumeSkills =
                resumeTechnologies
                        .stream()
                        .map(ResumeTechnology::getTechnology)
                        .map(technology ->
                                normalize(
                                        technology.getName()
                                )
                        )
                        .collect(Collectors.toSet());

        // ---------------------------------------------------------
        // 5. Index resume for semantic fallback
        // ---------------------------------------------------------

        indexResume(resume);

        // ---------------------------------------------------------
        // 6. Result collections
        // ---------------------------------------------------------

        List<String> matchedSkills =
                new ArrayList<>();

        List<String> missingRequiredSkills =
                new ArrayList<>();

        List<String> missingPreferredSkills =
                new ArrayList<>();

        List<SkillGap> skillGaps =
                new ArrayList<>();

        int totalRequired = 0;
        int matchedRequired = 0;

        // ---------------------------------------------------------
        // 7. Match each requirement
        // ---------------------------------------------------------

        for (JobRequirement requirement :
                requirements) {

            if (requirement.getRequirement() == null
                    || requirement.getRequirement().isBlank()) {

                continue;
            }

            String requirementText =
                    requirement.getRequirement().trim();

            String normalizedRequirement =
                    normalize(requirementText);

            // -----------------------------------------------------
            // Layer 1: Resume technology profile
            // -----------------------------------------------------

            boolean exactMatched =
                    isSkillMatched(
                            normalizedRequirement,
                            resumeSkills
                    );

            // -----------------------------------------------------
            // Layer 2: Direct resume text
            // -----------------------------------------------------

            boolean resumeTextMatched =
                    isRequirementSupportedByResumeText(
                            requirementText,
                            resume.getExtractedText()
                    );

            // -----------------------------------------------------
            // Layer 3: Semantic fallback
            // -----------------------------------------------------

            boolean semanticMatched = false;

            if (!exactMatched
                    && !resumeTextMatched) {

                SemanticMatch semanticMatch =
                        findSemanticMatch(
                                requirementText,
                                resume.getId()
                        );

                semanticMatched =
                        semanticMatch.score()
                                >= SEMANTIC_MATCH_THRESHOLD;
            }

            // -----------------------------------------------------
            // Final match
            // -----------------------------------------------------

            boolean matched =
                    exactMatched
                            || resumeTextMatched
                            || semanticMatched;

            // -----------------------------------------------------
            // Required
            // -----------------------------------------------------

            if (requirement.getType()
                    == JobRequirementType.REQUIRED) {

                totalRequired++;

                if (matched) {

                    matchedRequired++;

                    addIfAbsent(
                            matchedSkills,
                            requirementText
                    );

                } else {

                    addIfAbsent(
                            missingRequiredSkills,
                            requirementText
                    );

                    SkillGap skillGap =
                            skillGapIntelligenceService
                                    .createSkillGap(
                                            requirement
                                    );

                    addSkillGapIfAbsent(
                            skillGaps,
                            skillGap
                    );
                }
            }

            // -----------------------------------------------------
            // Preferred
            // -----------------------------------------------------

            else if (requirement.getType()
                    == JobRequirementType.PREFERRED) {

                if (matched) {

                    addIfAbsent(
                            matchedSkills,
                            requirementText
                    );

                } else {

                    addIfAbsent(
                            missingPreferredSkills,
                            requirementText
                    );

                    SkillGap skillGap =
                            skillGapIntelligenceService
                                    .createSkillGap(
                                            requirement
                                    );

                    addSkillGapIfAbsent(
                            skillGaps,
                            skillGap
                    );
                }
            }
        }

        // ---------------------------------------------------------
        // 8. Calculate match score
        // ---------------------------------------------------------

        int matchScore =
                calculateMatchScore(
                        totalRequired,
                        matchedRequired
                );

        // ---------------------------------------------------------
        // 9. Return response
        // ---------------------------------------------------------

        return new JobMatchResponse(
                resume.getId(),
                jobDescription.getId(),
                matchScore,
                matchedSkills,
                missingRequiredSkills,
                missingPreferredSkills,
                skillGaps
        );
    }

    /**
     * Index extracted resume text in PGVector.
     */
    private void indexResume(
            Resume resume
    ) {

        String extractedText =
                resume.getExtractedText();

        if (extractedText == null
                || extractedText.isBlank()) {

            throw new IllegalStateException(
                    "Resume does not contain extracted text"
            );
        }

        String filterExpression =
                "entityType == 'RESUME' && resumeId == "
                        + resume.getId();

        embeddingService.deleteByMetadata(
                filterExpression
        );

        List<String> chunks =
                splitIntoChunks(
                        extractedText
                );

        List<Document> documents =
                new ArrayList<>();

        for (int i = 0;
             i < chunks.size();
             i++) {

            documents.add(
                    new Document(
                            chunks.get(i),
                            Map.of(
                                    "entityType",
                                    "RESUME",
                                    "resumeId",
                                    resume.getId(),
                                    "chunkIndex",
                                    i
                            )
                    )
            );
        }

        embeddingService.storeDocuments(
                documents
        );
    }

    /**
     * Semantic search restricted to the current resume.
     */
    private SemanticMatch findSemanticMatch(
            String requirement,
            Long resumeId
    ) {

        String filterExpression =
                "entityType == 'RESUME' && resumeId == "
                        + resumeId;

        List<Document> results =
                embeddingService.search(
                        requirement,
                        1,
                        filterExpression
                );

        if (results.isEmpty()) {

            return new SemanticMatch(
                    0.0,
                    null
            );
        }

        Document bestResult =
                results.getFirst();

        Double score =
                bestResult.getScore();

        if (score == null) {

            return new SemanticMatch(
                    0.0,
                    bestResult.getText()
            );
        }

        return new SemanticMatch(
                score,
                bestResult.getText()
        );
    }

    /**
     * Checks direct evidence in resume text.
     */
    private boolean isRequirementSupportedByResumeText(
            String requirement,
            String resumeText
    ) {

        if (requirement == null
                || requirement.isBlank()
                || resumeText == null
                || resumeText.isBlank()) {

            return false;
        }

        String normalizedResumeText =
                normalize(resumeText);

        String normalizedRequirement =
                normalize(requirement);

        // Direct phrase match
        if (normalizedResumeText.contains(
                normalizedRequirement
        )) {
            return true;
        }

        return switch (normalizedRequirement) {

            case "object-oriented programming" ->

                    normalizedResumeText.contains(
                            "object oriented programming"
                    )
                    || normalizedResumeText.contains(
                            "oop"
                    );

            case "database concepts" ->

                    normalizedResumeText.contains(
                            "database concepts"
                    )
                    || normalizedResumeText.contains(
                            "database management systems"
                    )
                    || normalizedResumeText.contains(
                            "database management system"
                    )
                    || normalizedResumeText.contains(
                            "dbms"
                    );

            case "exception handling" ->

                    normalizedResumeText.contains(
                            "exception handling"
                    )
                    || normalizedResumeText.contains(
                            "exception handling in java"
                    )
                    || normalizedResumeText.contains(
                            "java exception handling"
                    )
                    || normalizedResumeText.contains(
                            "exceptions in java"
                    )
                    || normalizedResumeText.contains(
                            "java exceptions"
                    );

            default -> false;
        };
    }

    /**
     * Splits resume text into embedding chunks.
     */
    private List<String> splitIntoChunks(
            String text
    ) {

        List<String> chunks =
                new ArrayList<>();

        String normalized =
                text.trim()
                        .replaceAll(
                                "\\s+",
                                " "
                        );

        for (int start = 0;
             start < normalized.length();
             start += RESUME_CHUNK_SIZE) {

            int end =
                    Math.min(
                            start + RESUME_CHUNK_SIZE,
                            normalized.length()
                    );

            String chunk =
                    normalized.substring(
                            start,
                            end
                    ).trim();

            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }
        }

        return chunks;
    }

    /**
     * Matches JD requirements against extracted
     * resume technologies.
     */
    private boolean isSkillMatched(
        String requirement,
        Set<String> resumeSkills
) {

    String normalizedRequirement =
            normalize(requirement);

    if (resumeSkills.contains(
            normalizedRequirement
    )) {
        return true;
    }

    for (String resumeSkill : resumeSkills) {

        String normalizedResumeSkill =
                normalize(resumeSkill);

        if (normalizedResumeSkill.equals(
                normalizedRequirement
        )) {
            return true;
        }

        if (normalizedResumeSkill.contains(
                normalizedRequirement
        )
                || normalizedRequirement.contains(
                normalizedResumeSkill
        )) {
            return true;
        }
    }

    return false;
}

    /**
     * Calculates required-skill coverage.
     */
    private int calculateMatchScore(
            int totalRequired,
            int matchedRequired
    ) {

        if (totalRequired == 0) {
            return 0;
        }

        return Math.round(
                ((float) matchedRequired
                        / totalRequired)
                        * 100
        );
    }

    private void addIfAbsent(
            List<String> list,
            String value
    ) {

        if (!list.contains(value)) {
            list.add(value);
        }
    }

    private void addSkillGapIfAbsent(
            List<SkillGap> skillGaps,
            SkillGap skillGap
    ) {

        boolean exists =
                skillGaps.stream()
                        .anyMatch(existing ->
                                existing.skill()
                                        .equalsIgnoreCase(
                                                skillGap.skill()
                                        )
                        );

        if (!exists) {
            skillGaps.add(skillGap);
        }
    }

    private String normalize(String value) {

    if (value == null) {
        return "";
    }

    String normalized = value
            .toLowerCase(Locale.ROOT)
            .trim()
            .replaceAll("[^a-z0-9+#.\\- ]", " ")
            .replaceAll("\\s+", " ");

    return switch (normalized) {

        case "react.js", "reactjs" ->
                "react";

        case "html5" ->
                "html";

        case "css3" ->
                "css";

        case "rest api", "restful api", "restful apis" ->
                "rest apis";

        case "jwt" ->
                "jwt authentication";

        case "spring data jpa" ->
                "jpa";

        default ->
                normalized;
    };
}

    private record SemanticMatch(
            double score,
            String matchedText
    ) {
    }
}