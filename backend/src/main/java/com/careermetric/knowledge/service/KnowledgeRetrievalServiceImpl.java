package com.careermetric.knowledge.service;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;


import com.careermetric.ai.service.EmbeddingService;

import java.util.List;

@Service
public class KnowledgeRetrievalServiceImpl
        implements KnowledgeRetrievalService {

    private final EmbeddingService embeddingService;

    public KnowledgeRetrievalServiceImpl(
            EmbeddingService embeddingService) {

        this.embeddingService = embeddingService;
    }

    @Override
    public List<Document> search(
            String query,
            int topK) {

        validateQuery(query);
        validateTopK(topK);

        return cleanResults(
                embeddingService.search(
                        query.trim(),
                        topK,
                        "entityType == 'KNOWLEDGE'"
                )
        );
    }

    @Override
    public List<Document> search(
            String query,
            int topK,
            String topic) {

        validateQuery(query);
        validateTopK(topK);

        if (topic == null || topic.isBlank()) {
            return search(query, topK);
        }

        String cleanTopic = topic.trim();

        String filterExpression =
                "entityType == 'KNOWLEDGE' && topic == '"
                        + escapeFilterValue(cleanTopic)
                        + "'";

        return cleanResults(
                embeddingService.search(
                        query.trim(),
                        topK,
                        filterExpression
                )
        );
    }

    private List<Document> cleanResults(
            List<Document> documents) {

        if (documents == null || documents.isEmpty()) {
            return List.of();
        }

        return documents.stream()
                .filter(document ->
                        document != null
                                && document.getText() != null
                                && !document.getText().isBlank()
                )
                .distinct()
                .toList();
    }

    private void validateQuery(String query) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException(
                    "Search query is required"
            );
        }
    }

    private void validateTopK(int topK) {

        if (topK < 1 || topK > 10) {
            throw new IllegalArgumentException(
                    "topK must be between 1 and 10"
            );
        }
    }

    private String escapeFilterValue(String value) {

        return value.replace("'", "''");
    }
}