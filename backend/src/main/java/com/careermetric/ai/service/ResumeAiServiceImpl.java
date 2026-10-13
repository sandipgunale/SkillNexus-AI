package com.careermetric.ai.service;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ResumeAiServiceImpl implements ResumeAiService {

    private final ChatClient chatClient;

    public ResumeAiServiceImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public ResumeAnalysisAiResult analyzeResume(String resumeText) {

        return chatClient
                .prompt()
                .system("""
                        You are SkillNexus AI's resume analysis engine.

                        Analyze resumes carefully and provide evidence-based
                        professional feedback.

                        Rules:
                        - Only use information explicitly present in the resume.
                        - Never invent skills, experience, projects, certifications,
                          education, employment history, or achievements.
                        - Do not generate an overall numeric resume score.
                        - Identify strengths and weaknesses based on evidence.
                        - Identify missing resume elements when reasonably supported.
                        - Provide practical improvement suggestions.
                        - Keep the analysis professional and concise.
                        """)
                .user(user -> user
                        .text("""
                                Analyze the following resume.

                                Resume:
                                {resumeText}
                                """)
                        .param("resumeText", resumeText))
                .call()
                .entity(
                        ResumeAnalysisAiResult.class,
                        spec -> spec.validateSchema()
                );
    }
}