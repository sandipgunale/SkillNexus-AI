package com.careermetric.ai.service;

import com.careermetric.ai.dto.JobDescriptionAiResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class JobAiServiceImpl implements JobAiService {

    private final ChatClient chatClient;

    public JobAiServiceImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public JobDescriptionAiResult analyzeJobDescription(String jobDescription) {

        if (jobDescription == null || jobDescription.isBlank()) {
            throw new IllegalArgumentException(
                    "Job description cannot be empty"
            );
        }

        String prompt = """
                You are an expert technical recruiter and job description analyzer.

                Analyze the following job description.

                JOB DESCRIPTION:
                %s

                Extract the following information:

                1. Required skills
                2. Preferred skills
                3. Experience requirements
                4. Responsibilities
                5. Technology requirements

                Important rules:

                - Extract information only from the provided job description.
                - Do not invent requirements.
                - Do not assume technologies that are not mentioned.
                - Keep skills concise and normalized.
                - Keep responsibilities concise.
                - Separate required skills from preferred skills.
                - If a category is not present, return an empty list.
                - If experience information is not present, return an empty string.
                - Technology requirements should contain actual technologies,
                  frameworks, databases, tools, or platforms mentioned.
                - Do not add explanations outside the requested structure.
                - Return only the structured output.
                """.formatted(jobDescription);

        JobDescriptionAiResult result = chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(
                        JobDescriptionAiResult.class,
                        spec -> spec
                                .useProviderStructuredOutput()
                                .validateSchema()
                );

        validateResult(result);

        return result;
    }

    private void validateResult(JobDescriptionAiResult result) {

        if (result == null) {
            throw new IllegalStateException(
                    "AI returned an invalid job description analysis"
            );
        }

        if (result.requiredSkills() == null) {
            throw new IllegalStateException(
                    "AI returned invalid required skills"
            );
        }

        if (result.preferredSkills() == null) {
            throw new IllegalStateException(
                    "AI returned invalid preferred skills"
            );
        }

        if (result.responsibilities() == null) {
            throw new IllegalStateException(
                    "AI returned invalid responsibilities"
            );
        }

        if (result.technologyRequirements() == null) {
            throw new IllegalStateException(
                    "AI returned invalid technology requirements"
            );
        }

        if (result.experience() == null) {
            throw new IllegalStateException(
                    "AI returned invalid experience information"
            );
        }
    }
}