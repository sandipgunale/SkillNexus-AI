package com.careermetric.ai.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmbeddingServiceImpl implements EmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final VectorStore vectorStore;

    public EmbeddingServiceImpl(
            @Qualifier("googleGenAiTextEmbedding")
            EmbeddingModel embeddingModel,
            VectorStore vectorStore) {

        this.embeddingModel = embeddingModel;
        this.vectorStore = vectorStore;
    }

    @Override
    public float[] generateEmbedding(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Text is required for embedding generation"
            );
        }

        return embeddingModel.embed(text.trim());
    }

    @Override
    public Document store(
            String text,
            Map<String, Object> metadata) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Document text is required"
            );
        }

        Document document = new Document(
                text.trim(),
                metadata
        );

        vectorStore.add(List.of(document));

        return document;
    }

    @Override
    public void storeDocuments(List<Document> documents) {

        if (documents == null || documents.isEmpty()) {
            return;
        }

        List<Document> validDocuments = documents.stream()
                .filter(document ->
                        document != null
                                && document.getText() != null
                                && !document.getText().isBlank()
                )
                .toList();

        if (validDocuments.isEmpty()) {
            return;
        }

        vectorStore.add(validDocuments);
    }

    @Override
    public void deleteByMetadata(String filterExpression) {

        if (filterExpression == null
                || filterExpression.isBlank()) {

            throw new IllegalArgumentException(
                    "Filter expression is required"
            );
        }

        vectorStore.delete(filterExpression);
    }

    @Override
    public List<Document> search(
            String query,
            int topK) {

        validateSearch(query, topK);

        SearchRequest searchRequest =
                SearchRequest.builder()
                        .query(query.trim())
                        .topK(topK)
                        .build();

        return vectorStore.similaritySearch(searchRequest);
    }

    @Override
    public List<Document> search(
            String query,
            int topK,
            String filterExpression) {

        validateSearch(query, topK);

        if (filterExpression == null
                || filterExpression.isBlank()) {

            return search(query, topK);
        }

        SearchRequest searchRequest =
                SearchRequest.builder()
                        .query(query.trim())
                        .topK(topK)
                        .filterExpression(filterExpression)
                        .build();

        return vectorStore.similaritySearch(searchRequest);
    }

    private void validateSearch(
            String query,
            int topK) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException(
                    "Search query is required"
            );
        }

        if (topK < 1 || topK > 10) {
            throw new IllegalArgumentException(
                    "topK must be between 1 and 10"
            );
        }
    }
}