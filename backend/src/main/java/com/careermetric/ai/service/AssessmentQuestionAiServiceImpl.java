package com.careermetric.ai.service;

import com.careermetric.ai.dto.AssessmentQuestionAiResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AssessmentQuestionAiServiceImpl
        implements AssessmentQuestionAiService {

    private final ChatClient chatClient;

    public AssessmentQuestionAiServiceImpl(
            ChatClient chatClient
    ) {
        this.chatClient = chatClient;
    }

    @Override
    public AssessmentQuestionAiResult generateQuestions(
            String technologyName,
            String difficulty,
            int questionCount
    ) {

        if (technologyName == null
                || technologyName.isBlank()) {

            throw new IllegalArgumentException(
                    "Technology name is required"
            );
        }

        if (difficulty == null
                || difficulty.isBlank()) {

            throw new IllegalArgumentException(
                    "Difficulty is required"
            );
        }

        if (questionCount <= 0) {

            throw new IllegalArgumentException(
                    "Question count must be greater than zero"
            );
        }

        String systemPrompt = """
                You are the assessment question generator
                for SkillNexus AI.

                Your job is to generate technical assessment
                questions for a candidate.

                Follow these rules strictly:

                1. Generate questions ONLY about the requested
                   technology.

                2. Match the requested difficulty exactly.

                3. Generate exactly the requested number of
                   questions.

                4. Every question must be an MCQ.

                5. Every question must contain exactly
                   four options.

                6. There must be exactly one correct answer.

                7. The correct answer MUST exactly match
                   one of the four options.

                8. Provide a concise explanation of why the
                   correct answer is correct.

                9. Do not generate duplicate questions.

                10. Do not invent APIs, classes, features,
                    syntax or behavior that do not exist.

                11. Avoid trick questions unless they test
                    a genuine technical concept.

                12. Questions should be appropriate for a
                    Java Full Stack Developer candidate.

                13. Return only the requested structured
                    output. Do not include additional text.

                14. questionType must always be "MCQ".

                Requested technology:
                %s

                Requested difficulty:
                %s

                Requested question count:
                %d
                """.formatted(
                technologyName,
                difficulty,
                questionCount
        );

        return chatClient
                .prompt()
                .system(systemPrompt)
                .user("""
                        Generate the assessment questions
                        according to the system instructions.
                        """)
                .call()
                .entity(
                        AssessmentQuestionAiResult.class,
                        spec -> spec
                                .useProviderStructuredOutput()
                                .validateSchema()
                );
    }
}