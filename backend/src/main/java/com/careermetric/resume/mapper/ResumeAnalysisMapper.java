package com.careermetric.resume.mapper;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import com.careermetric.ai.dto.ResumeRecommendation;
import com.careermetric.ai.dto.ResumeRecommendationAiResult;
import com.careermetric.ai.dto.ResumeSectionAnalysis;
import com.careermetric.resume.dto.ResumeAnalysisResponse;
import com.careermetric.resume.dto.ResumeRecommendationData;
import com.careermetric.resume.dto.ScoreBreakdown;
import com.careermetric.resume.entity.Resume;
import com.careermetric.resume.entity.ResumeAnalysis;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ResumeAnalysisMapper {

    private final ObjectMapper objectMapper;

    public ResumeAnalysisMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /*
     * Converts a new AI analysis result into a ResumeAnalysis entity.
     */
    public ResumeAnalysis toEntity(
            Resume resume,
            ResumeAnalysisAiResult aiResult,
            ResumeRecommendationAiResult recommendationAiResult,
            Integer overallScore,
            ScoreBreakdown scoreBreakdown
    ) {

        ResumeAnalysis analysis = new ResumeAnalysis();

        analysis.setResume(resume);

        analysis.setOverallScore(overallScore);

        analysis.setScoreBreakdown(
                objectMapper.convertValue(
                        scoreBreakdown,
                        new TypeReference<Map<String, Integer>>() {
                        }
                )
        );

        analysis.setSummary(
                aiResult.summary()
        );

        analysis.setStrengths(
                aiResult.strengths()
        );

        analysis.setWeaknesses(
                aiResult.weaknesses()
        );

        analysis.setMissingElements(
                aiResult.missingElements()
        );

        analysis.setSuggestions(
                aiResult.suggestions()
        );

        analysis.setRecommendations(
                toRecommendationData(recommendationAiResult)
        );

        analysis.setSections(
                objectMapper.convertValue(
                        aiResult.sections(),
                        new TypeReference<Map<String, Object>>() {
                        }
                )
        );

        return analysis;
    }

    /*
     * Updates an existing ResumeAnalysis entity.
     *
     * Used when the user analyzes the same resume again.
     */
    public void updateEntity(
            ResumeAnalysis analysis,
            ResumeAnalysisAiResult aiResult,
            ResumeRecommendationAiResult recommendationAiResult,
            Integer overallScore,
            ScoreBreakdown scoreBreakdown
    ) {

        analysis.setOverallScore(
                overallScore
        );

        analysis.setScoreBreakdown(
                objectMapper.convertValue(
                        scoreBreakdown,
                        new TypeReference<Map<String, Integer>>() {
                        }
                )
        );

        analysis.setSummary(
                aiResult.summary()
        );

        analysis.setStrengths(
                aiResult.strengths()
        );

        analysis.setWeaknesses(
                aiResult.weaknesses()
        );

        analysis.setMissingElements(
                aiResult.missingElements()
        );

        analysis.setSuggestions(
                aiResult.suggestions()
        );

        analysis.setRecommendations(
                toRecommendationData(recommendationAiResult)
        );

        analysis.setSections(
                objectMapper.convertValue(
                        aiResult.sections(),
                        new TypeReference<Map<String, Object>>() {
                        }
                )
        );
    }

    /*
     * Converts AI recommendation DTOs into persistence DTOs.
     */
    private List<ResumeRecommendationData> toRecommendationData(
            ResumeRecommendationAiResult recommendationAiResult
    ) {

        if (recommendationAiResult == null
                || recommendationAiResult.recommendations() == null) {

            return List.of();
        }

        return recommendationAiResult.recommendations()
                .stream()
                .map(this::toRecommendationData)
                .toList();
    }

    /*
     * Converts a single AI recommendation into
     * the application/persistence representation.
     */
    private ResumeRecommendationData toRecommendationData(
            ResumeRecommendation recommendation
    ) {

        return new ResumeRecommendationData(
                recommendation.category(),
                recommendation.priority(),
                recommendation.recommendation(),
                recommendation.reason(),
                recommendation.action()
        );
    }

    /*
     * Converts the persisted ResumeAnalysis entity
     * into the API response returned to the frontend.
     */
    public ResumeAnalysisResponse toResponse(
            ResumeAnalysis analysis
    ) {

        ScoreBreakdown scoreBreakdown =
                objectMapper.convertValue(
                        analysis.getScoreBreakdown(),
                        ScoreBreakdown.class
                );

        ResumeSectionAnalysis sections =
                objectMapper.convertValue(
                        analysis.getSections(),
                        ResumeSectionAnalysis.class
                );

        return new ResumeAnalysisResponse(
                analysis.getResume().getId(),
                analysis.getOverallScore(),
                scoreBreakdown,
                analysis.getSummary(),
                analysis.getStrengths(),
                analysis.getWeaknesses(),
                analysis.getMissingElements(),
                analysis.getSuggestions(),
                analysis.getRecommendations(),
                sections
        );
    }
}