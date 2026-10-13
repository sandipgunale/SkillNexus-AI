package com.careermetric.knowledge.service;

import org.springframework.ai.document.Document;

import java.util.List;

public interface KnowledgeRetrievalService {

    List<Document> search(
            String query,
            int topK
    );

    List<Document> search(
            String query,
            int topK,
            String topic
    );
}