package com.careermetric.ai.rag;

import com.careermetric.ai.rag.dto.RagResponse;
import com.careermetric.ai.rag.dto.RagSource;
import com.careermetric.knowledge.service.KnowledgeRetrievalService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagServiceImpl implements RagService {

    private static final int DEFAULT_TOP_K = 3;

    private final ChatClient chatClient;
    private final KnowledgeRetrievalService retrievalService;

    public RagServiceImpl(
            ChatClient chatClient,
            KnowledgeRetrievalService retrievalService) {

        this.chatClient = chatClient;
        this.retrievalService = retrievalService;
    }

    @Override
    public RagResponse ask(
            String question,
            String conversationId) {

        return generateAnswer(
                question,
                null,
                conversationId
        );
    }

    @Override
    public RagResponse ask(
            String question,
            String topic,
            String conversationId) {

        return generateAnswer(
                question,
                topic,
                conversationId
        );
    }

    private RagResponse generateAnswer(
            String question,
            String topic,
            String conversationId) {

        validateQuestion(question);
        validateConversationId(conversationId);

        String cleanQuestion = question.trim();
        String cleanConversationId = conversationId.trim();

        List<Document> documents;

        if (topic == null || topic.isBlank()) {

            documents = retrievalService.search(
                    cleanQuestion,
                    DEFAULT_TOP_K
            );

        } else {

            documents = retrievalService.search(
                    cleanQuestion,
                    DEFAULT_TOP_K,
                    topic.trim()
            );
        }

        String context = buildContext(documents);

        String systemPrompt = """
                You are SkillNexus AI, an AI career and technical learning assistant.

                Your task is to answer the user's question using the retrieved
                knowledge sources and the conversation history when necessary.

                STRICT GROUNDING RULES:

                1. Use the retrieved knowledge sources as the factual basis
                   for technical answers.

                2. Conversation history may be used to understand references
                   such as "it", "this", "that", or follow-up questions.

                3. Do not use previous assistant messages as a replacement
                   for retrieved knowledge.

                4. Do not use your own general knowledge to fill gaps in
                   the retrieved knowledge context.

                5. Do not invent facts, explanations, examples, code,
                   or definitions.

                6. If the retrieved knowledge does not contain enough
                   information to answer the technical question, clearly
                   state that the available knowledge base does not contain
                   enough information.

                7. When multiple knowledge sources are provided, combine
                   them only when their content supports the answer.

                8. Give a clear and technically useful answer.

                9. Use examples only when they are directly supported by
                   the retrieved knowledge.
                """;

        String userPrompt = """
                RETRIEVED KNOWLEDGE SOURCES:

                %s

                CURRENT USER QUESTION:

                %s

                Answer the current question using the retrieved knowledge
                sources above. Use the conversation history only to understand
                the context of the user's question.
                """.formatted(
                context,
                cleanQuestion
        );

        String answer = chatClient
                .prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .advisors(advisorSpec ->
                        advisorSpec.param(
                                ChatMemory.CONVERSATION_ID,
                                cleanConversationId
                        )
                )
                .call()
                .content();

        List<RagSource> sources = documents.stream()
                .map(document -> {

                    Object title =
                            document.getMetadata().get("title");

                    Object documentTopic =
                            document.getMetadata().get("topic");

                    return new RagSource(
                            title != null
                                    ? title.toString()
                                    : "Unknown",
                            documentTopic != null
                                    ? documentTopic.toString()
                                    : "Unknown"
                    );
                })
                .distinct()
                .toList();

        return new RagResponse(
                answer,
                sources
        );
    }

    private String buildContext(
            List<Document> documents) {

        if (documents == null || documents.isEmpty()) {
            return "No relevant knowledge was retrieved.";
        }

        StringBuilder context = new StringBuilder();

        for (int i = 0; i < documents.size(); i++) {

            Document document = documents.get(i);

            Object title =
                    document.getMetadata().get("title");

            Object topic =
                    document.getMetadata().get("topic");

            context.append("SOURCE ")
                    .append(i + 1)
                    .append("\n");

            context.append("TITLE: ")
                    .append(title != null
                            ? title
                            : "Unknown")
                    .append("\n");

            context.append("TOPIC: ")
                    .append(topic != null
                            ? topic
                            : "Unknown")
                    .append("\n");

            context.append("CONTENT:\n")
                    .append(document.getText())
                    .append("\n");

            context.append("\n--------------------\n\n");
        }

        return context.toString();
    }

    private void validateQuestion(
            String question) {

        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException(
                    "Question is required"
            );
        }
    }

    private void validateConversationId(
            String conversationId) {

        if (conversationId == null
                || conversationId.isBlank()) {

            throw new IllegalArgumentException(
                    "Conversation ID is required"
            );
        }
    }
}