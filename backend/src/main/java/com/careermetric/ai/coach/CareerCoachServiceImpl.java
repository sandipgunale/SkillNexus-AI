package com.careermetric.ai.coach;

import com.careermetric.ai.coach.dto.CareerCoachRequest;
import com.careermetric.ai.coach.dto.CareerCoachResponse;
import com.careermetric.ai.tool.CareerMetricTools;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;

@Service
public class CareerCoachServiceImpl implements CareerCoachService {

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    private final CareerMetricTools careerMetricTools;

    public CareerCoachServiceImpl(
            ChatClient chatClient,
            ChatMemory chatMemory,
            CareerMetricTools careerMetricTools
    ) {
        this.chatClient = chatClient;
        this.chatMemory = chatMemory;
        this.careerMetricTools = careerMetricTools;
    }

    @Override
    public CareerCoachResponse ask(CareerCoachRequest request) {

        String question = request.question().trim();

        String conversationId =
                request.conversationId().trim();

        String systemPrompt = buildSystemPrompt();

        String answer =
                chatClient
                        .prompt()
                        .system(systemPrompt)
                        .user(question)
                        .tools(careerMetricTools)
                        .advisors(advisorSpec ->
                                advisorSpec
                                        .advisors(
                                                MessageChatMemoryAdvisor
                                                        .builder(chatMemory)
                                                        .build()
                                        )
                                        .param(
                                                ChatMemory.CONVERSATION_ID,
                                                conversationId
                                        )
                        )
                        .call()
                        .content();

        return new CareerCoachResponse(
                normalizeMarkdown(answer)
        );
    }

    @Override
    public Flux<String> stream(CareerCoachRequest request) {

        String question = request.question().trim();

        String conversationId =
                request.conversationId().trim();

        String systemPrompt = buildSystemPrompt();

        String answer =
                chatClient
                        .prompt()
                        .system(systemPrompt)
                        .user(question)
                        .tools(careerMetricTools)
                        .advisors(advisorSpec ->
                                advisorSpec
                                        .advisors(
                                                MessageChatMemoryAdvisor
                                                        .builder(chatMemory)
                                                        .build()
                                        )
                                        .param(
                                                ChatMemory.CONVERSATION_ID,
                                                conversationId
                                        )
                        )
                        .call()
                        .content();

        String normalizedAnswer =
                normalizeMarkdown(answer);

        return Flux.fromArray(
                normalizedAnswer.split(
                        "(?<=\\s)",
                        -1
                )
        );
    }

    private String buildSystemPrompt() {

        return """
                You are SkillNexus AI Career Coach.

                You help users understand their technical profile,
                improve their preparation, and make practical career
                preparation decisions.

                IMPORTANT RULES:

                1. Use the available SkillNexus tools when the user's
                   question requires information about their own resume
                   or technical profile.

                2. Never invent information about the user's:
                   - skills
                   - projects
                   - experience
                   - education
                   - certifications
                   - employment history

                3. When discussing the user's resume, rely only on
                   information returned by the available tools.

                4. Do not claim that the user knows a technology unless
                   the available user data supports that claim.

                5. Give practical and concise guidance.

                6. When information about the user is unavailable,
                   clearly say so.

                7. You may use conversation history to understand
                   follow-up questions.

                8. Do not expose internal tool names, database details,
                   JWT details, or implementation details.

                9. Do not pretend that an action was performed when
                   it was not performed.

                10. Focus on Java Full Stack and software-development
                    career preparation when relevant.

                ========================================================
                RESPONSE FORMAT
                ========================================================

                Your response will be rendered by a Markdown chat UI.

                ALWAYS produce clean Markdown.

                IMPORTANT:

                - Keep paragraphs separated by blank lines.
                - Put every list item on its own line.
                - Put every heading on its own line.
                - Put a blank line before and after headings.
                - Use **bold** for important terms.
                - Use bullet lists for multiple related points.
                - Use numbered lists for ordered steps.
                - Use `inline code` for technologies, APIs, classes,
                  commands, or programming concepts when appropriate.
                - Use fenced code blocks for multi-line code.

                DO NOT use Markdown tables.

                This is important.

                Instead of tables, use clear sections and bullet lists.

                NEVER place multiple list items on one line.

                NEVER place multiple headings on one line.

                NEVER put Markdown syntax immediately after normal text
                without a newline.

                NEVER use HTML such as <br>.

                ========================================================
                REQUIRED RESPONSE STYLE
                ========================================================

                Prefer this style:

                ### Resume Gaps

                Your resume already covers the core Java Full Stack
                technologies. A few areas can be strengthened.

                **1. Professional Experience**

                - Add internships if you have completed any.
                - Mention your responsibilities.
                - Mention the technologies you actually used.
                - Add measurable outcomes when you have genuine data.

                **2. Certifications**

                - Add relevant certifications if you have them.
                - Do not add certifications you have not completed.

                **3. Project Impact**

                - Add measurable results where supported.
                - Mention performance improvements if you actually measured them.

                ### Recommended Next Steps

                1. **Improve project descriptions**

                2. **Strengthen your experience section**

                3. **Add genuine certifications**

                4. **Prepare for Java Full Stack interviews**

                ========================================================
                FINAL RULE
                ========================================================

                Return ONLY the actual answer to the user's question.

                Do not explain these formatting instructions.

                Do not use tables.

                Do not use HTML.

                Keep the response readable, structured, and natural.
                """;
    }

    private String normalizeMarkdown(String content) {

        if (content == null || content.isBlank()) {
            return "";
        }

        String normalized = content
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replace("<br>", "\n")
                .replace("<br/>", "\n")
                .replace("<br />", "\n");

        /*
         * Fix flattened headings.
         *
         * Example:
         *
         * text### Heading
         *
         * becomes:
         *
         * text
         *
         * ### Heading
         */
        normalized = normalized.replaceAll(
                "\\s+(#{1,6}\\s+)",
                "\n\n$1"
        );

        /*
         * Fix flattened numbered lists.
         *
         * Example:
         *
         * text 1. First 2. Second 3. Third
         *
         * becomes separate lines.
         */
        normalized = normalized.replaceAll(
                "\\s+(?=\\d+\\.\\s+)",
                "\n"
        );

        /*
         * Fix flattened bullet lists.
         */
        normalized = normalized.replaceAll(
                "\\s+(?=[*-]\\s+)",
                "\n"
        );

        /*
         * If the model still creates a pipe-based table,
         * convert the row boundaries into real Markdown lines.
         *
         * Example:
         *
         * | A | B ||---|---|| C | D |
         *
         * becomes:
         *
         * | A | B |
         * |---|---|
         * | C | D |
         */
        normalized = normalized.replace(
                "||",
                "|\n|"
        );

        /*
         * Add spacing around Markdown table-like structures.
         */
        normalized = normalized.replaceAll(
                "(?m)(^\\|.*\\|$)",
                "$1"
        );

        /*
         * Clean excessive blank lines.
         */
        normalized = normalized.replaceAll(
                "\n{3,}",
                "\n\n"
        );

        return normalized.trim();
    }
}