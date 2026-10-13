package com.careermetric.ai.service;

import org.springframework.ai.document.Document;

import java.util.List;
import java.util.Map;

public interface EmbeddingService {

    float[] generateEmbedding(String text);

    Document store(
            String text,
            Map<String, Object> metadata
    );

    void storeDocuments(List<Document> documents);

    void deleteByMetadata(String filterExpression);

    List<Document> search(
            String query,
            int topK
    );

    List<Document> search(
            String query,
            int topK,
            String filterExpression
    );
}