package com.careermetric.knowledge.service;

public interface KnowledgeIndexingService {

    void indexDocument(Long knowledgeDocumentId);

    void deleteDocument(Long knowledgeDocumentId);
}