package com.careermetric.knowledge.repository;

import com.careermetric.knowledge.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KnowledgeDocumentRepository
        extends JpaRepository<KnowledgeDocument, Long> {

    List<KnowledgeDocument> findAllByTopicIgnoreCase(
            String topic
    );
}