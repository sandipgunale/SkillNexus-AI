package com.careermetric.ai.service;

import com.careermetric.ai.dto.InterviewEvaluationAiResult;
import com.careermetric.ai.dto.InterviewQuestionAiResult;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

@Service
public class InterviewAiServiceImpl implements InterviewAiService {

    private final ChatClient chatClient;

    public InterviewAiServiceImpl(
            ChatClient chatClient
    ) {
        this.chatClient = chatClient;
    }

    @Override
    public InterviewQuestionAiResult generateQuestions(
            String technologyName,
            String difficulty,
            int questionCount
    ) {

        String prompt = """
                You are an expert technical interviewer conducting
                a technical interview for a fresher Java Full Stack Developer.

                Generate exactly %d interview questions.

                Technology:
                %s

                Difficulty:
                %s

                Rules:
                1. Generate exactly %d questions.
                2. Questions must be open-ended technical interview questions.
                3. Questions must be relevant to the requested technology.
                4. Questions must match the requested difficulty.
                5. Questions must be suitable for a fresher or entry-level developer.
                6. Test understanding rather than simple memorization.
                7. Include practical or scenario-based questions where appropriate.
                8. Do not ask questions that require professional experience.
                9. Do not assume anything about the candidate.
                10. Do not invent APIs, classes, annotations, frameworks,
                    or technologies.
                11. Do not generate duplicate or nearly identical questions.
                12. Do not provide answers.
                13. Do not provide explanations.
                14. Return only the requested structured output.
                """.formatted(
                questionCount,
                technologyName,
                difficulty,
                questionCount
        );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(
                        groqCompatibleConverter(
                                InterviewQuestionAiResult.class
                        ),
                        spec -> spec
                                .useProviderStructuredOutput()
                                .validateSchema()
                );
    }

    @Override
    public InterviewEvaluationAiResult evaluateAnswer(
            String technologyName,
            String difficulty,
            String question,
            String answer
    ) {

        String prompt = """
                You are an expert technical interviewer evaluating
                a fresher-level technical interview answer.

                Technology:
                %s

                Difficulty:
                %s

                Interview Question:
                %s

                Candidate Answer:
                %s

                Evaluate the candidate answer objectively.

                Rules:
                1. Score the answer from 0 to 100.
                2. The score must be an integer.
                3. Evaluate technical correctness.
                4. Evaluate conceptual understanding.
                5. Evaluate relevance to the question.
                6. Evaluate whether important concepts are missing.
                7. Do not assume knowledge that is not present in the answer.
                8. Do not reward unrelated information.
                9. Identify specific strengths.
                10. Identify specific improvements.
                11. Feedback must be concise and useful for interview preparation.
                12. Do not invent facts about the candidate.
                13. Return only the requested structured output.
                """.formatted(
                technologyName,
                difficulty,
                question,
                answer
        );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(
                        groqCompatibleConverter(
                                InterviewEvaluationAiResult.class
                        ),
                        spec -> spec
                                .useProviderStructuredOutput()
                                .validateSchema()
                );
    }

    private <T> BeanOutputConverter<T> groqCompatibleConverter(
            Class<T> targetType
    ) {

        return new BeanOutputConverter<T>(targetType) {

            @Override
            protected String generateSchema() {

                String generatedSchema = super.generateSchema();

                try {
                    JsonMapper jsonMapper = JsonMapper.builder().build();

                    JsonNode root = jsonMapper.readTree(generatedSchema);

                    removeFormatProperties(root);

                    return jsonMapper.writeValueAsString(root);

                } catch (Exception exception) {

                    throw new IllegalStateException(
                            "Unable to create Groq-compatible JSON schema",
                            exception
                    );
                }
            }
        };
    }

    private void removeFormatProperties(JsonNode node) {

        if (node == null) {
            return;
        }

        if (node.isObject()) {

            ObjectNode objectNode = (ObjectNode) node;

            objectNode.remove("format");

            objectNode.forEach(
                    this::removeFormatProperties
            );

            return;
        }

        if (node.isArray()) {

            node.forEach(
                    this::removeFormatProperties
            );
        }
    }
}