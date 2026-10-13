package com.careermetric.ai.service;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import com.careermetric.ai.dto.ResumeRecommendationAiResult;
import com.careermetric.ai.dto.TechnologyExtractionAiResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ResumeRecommendationAiServiceImpl
        implements ResumeRecommendationAiService {

    private final ChatClient chatClient;

    public ResumeRecommendationAiServiceImpl(
            ChatClient chatClient
    ) {
        this.chatClient = chatClient;
    }

    @Override
    public ResumeRecommendationAiResult generateRecommendations(
            String resumeText,
            ResumeAnalysisAiResult analysis,
            TechnologyExtractionAiResult technologyExtraction
    ) {

        return chatClient
                .prompt()
                .system("""
                        You are SkillNexus AI's resume recommendation engine.

                        Your job is to generate practical, evidence-based
                        recommendations that improve the candidate's resume.

                        IMPORTANT RULES:

                        - Use only information supported by the resume,
                          resume analysis, and technology extraction.
                        - Never invent skills, experience, achievements,
                          certifications, metrics, employment history,
                          projects, or technologies.
                        - Never claim that the candidate achieved something
                          that is not present in the resume.
                        - Do not recommend adding false information.
                        - If a recommendation requires a metric or achievement,
                          tell the candidate to add it only if it is genuine.
                        - Do not recommend technologies simply because they
                          are popular.
                        - Do not recommend adding technologies that are not
                          supported by the candidate's resume.
                        - Avoid generic advice such as "improve your resume"
                          without explaining how.
                        - Recommendations must be specific and actionable.
                        - Prefer the highest-impact improvements first.
                        - Keep recommendations concise and professional.

                        Allowed categories:

                        SKILLS
                        PROJECTS
                        EXPERIENCE
                        EDUCATION
                        KEYWORDS
                        STRUCTURE
                        FORMATTING
                        GENERAL

                        Allowed priorities:

                        HIGH
                        MEDIUM
                        LOW

                        Generate recommendations based on actual evidence.
                        """)
                .user(user -> user
                        .text("""
                                Analyze the following information and generate
                                actionable resume improvement recommendations.

                                RESUME:
                                {resumeText}

                                RESUME ANALYSIS:
                                {analysis}

                                EXTRACTED TECHNOLOGIES:
                                {technologyExtraction}
                                """)
                        .param("resumeText", resumeText)
                        .param("analysis", analysis)
                        .param("technologyExtraction", technologyExtraction))
                .call()
                .entity(
                        ResumeRecommendationAiResult.class,
                        spec -> spec
                                .useProviderStructuredOutput()
                                .validateSchema()
                );
    }
}