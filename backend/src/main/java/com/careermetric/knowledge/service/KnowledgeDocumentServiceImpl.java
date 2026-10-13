package com.careermetric.knowledge.service;

import com.careermetric.knowledge.entity.KnowledgeDocument;
import com.careermetric.knowledge.repository.KnowledgeDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class KnowledgeDocumentServiceImpl
        implements KnowledgeDocumentService {

    private final KnowledgeDocumentRepository repository;

    private final KnowledgeIndexingService knowledgeIndexingService;

    public KnowledgeDocumentServiceImpl(
            KnowledgeDocumentRepository repository,
            KnowledgeIndexingService knowledgeIndexingService
    ) {
        this.repository = repository;
        this.knowledgeIndexingService =
                knowledgeIndexingService;
    }

    @Override
    public KnowledgeDocument create(
            String title,
            String topic,
            String sourceText
    ) {

        // ---------------------------------------------------------
        // 1. Validate title
        // ---------------------------------------------------------

        if (title == null || title.isBlank()) {

            throw new IllegalArgumentException(
                    "Knowledge document title is required"
            );
        }

        // ---------------------------------------------------------
        // 2. Validate topic
        // ---------------------------------------------------------

        if (topic == null || topic.isBlank()) {

            throw new IllegalArgumentException(
                    "Knowledge document topic is required"
            );
        }

        // ---------------------------------------------------------
        // 3. Validate source text
        // ---------------------------------------------------------

        if (sourceText == null || sourceText.isBlank()) {

            throw new IllegalArgumentException(
                    "Knowledge document source text is required"
            );
        }

        // ---------------------------------------------------------
        // 4. Create knowledge document
        // ---------------------------------------------------------

        KnowledgeDocument document =
                new KnowledgeDocument();

        document.setTitle(
                title.trim()
        );

        document.setTopic(
                topic.trim()
        );

        document.setSourceText(
                sourceText.trim()
        );

        // ---------------------------------------------------------
        // 5. Save metadata/source text in MySQL
        // ---------------------------------------------------------

        KnowledgeDocument saved =
                repository.save(document);

        // ---------------------------------------------------------
        // 6. Create chunks + embeddings
        //    and store them in PGVector
        // ---------------------------------------------------------

        knowledgeIndexingService.indexDocument(
                saved.getId()
        );

        // ---------------------------------------------------------
        // 7. Return saved document
        // ---------------------------------------------------------

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> findAll() {

        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeDocument findById(
            Long id
    ) {

        return repository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Knowledge document not found"
                        )
                );
    }
}