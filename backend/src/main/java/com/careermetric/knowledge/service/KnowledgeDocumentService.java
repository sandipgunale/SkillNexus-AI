package com.careermetric.knowledge.service;

import com.careermetric.knowledge.entity.KnowledgeDocument;

import java.util.List;

public interface KnowledgeDocumentService {

    KnowledgeDocument create(
            String title,
            String topic,
            String sourceText
    );

    List<KnowledgeDocument> findAll();

    KnowledgeDocument findById(Long id);
}