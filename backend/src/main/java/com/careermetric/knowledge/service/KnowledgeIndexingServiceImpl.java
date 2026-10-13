package com.careermetric.knowledge.service;

import com.careermetric.ai.service.EmbeddingService;
import com.careermetric.knowledge.entity.KnowledgeDocument;
import com.careermetric.knowledge.repository.KnowledgeDocumentRepository;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class KnowledgeIndexingServiceImpl
        implements KnowledgeIndexingService {

    private static final int CHUNK_SIZE = 1000;

    private final KnowledgeDocumentRepository
            knowledgeDocumentRepository;

    private final EmbeddingService embeddingService;

    public KnowledgeIndexingServiceImpl(
            KnowledgeDocumentRepository knowledgeDocumentRepository,
            EmbeddingService embeddingService
    ) {
        this.knowledgeDocumentRepository =
                knowledgeDocumentRepository;

        this.embeddingService =
                embeddingService;
    }

    @Override
    public void indexDocument(
            Long knowledgeDocumentId
    ) {

        KnowledgeDocument knowledgeDocument =
                knowledgeDocumentRepository
                        .findById(knowledgeDocumentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Knowledge document not found"
                                )
                        );

        // ---------------------------------------------------------
        // Remove previously indexed chunks
        // ---------------------------------------------------------

        deleteDocument(
                knowledgeDocumentId
        );

        // ---------------------------------------------------------
        // Split source text
        // ---------------------------------------------------------

        List<String> chunks =
                splitIntoChunks(
                        knowledgeDocument.getSourceText()
                );

        if (chunks.isEmpty()) {
            throw new IllegalStateException(
                    "Knowledge document contains no text"
            );
        }

        // ---------------------------------------------------------
        // Create Spring AI Documents
        // ---------------------------------------------------------

        List<Document> documents =
                new ArrayList<>();

        for (int i = 0;
             i < chunks.size();
             i++) {

            String chunk =
                    chunks.get(i);

            documents.add(
                    new Document(
                            chunk,
                            Map.of(
                                    "entityType",
                                    "KNOWLEDGE",
                                    "knowledgeDocumentId",
                                    knowledgeDocumentId,
                                    "title",
                                    knowledgeDocument.getTitle(),
                                    "topic",
                                    knowledgeDocument.getTopic(),
                                    "chunkIndex",
                                    i
                            )
                    )
            );
        }

        // ---------------------------------------------------------
        // Store embeddings in PGVector
        // ---------------------------------------------------------

        embeddingService.storeDocuments(
                documents
        );
    }

    @Override
    public void deleteDocument(
            Long knowledgeDocumentId
    ) {

        String filterExpression =
                "entityType == 'KNOWLEDGE' && knowledgeDocumentId == "
                        + knowledgeDocumentId;

        embeddingService.deleteByMetadata(
                filterExpression
        );
    }

    /**
     * Simple character-based chunking.
     *
     * Kept intentionally simple for the current
     * fresher-focused SkillNexus AI scope.
     */
    private List<String> splitIntoChunks(
            String text
    ) {

        List<String> chunks =
                new ArrayList<>();

        if (text == null
                || text.isBlank()) {

            return chunks;
        }

        String normalized =
                text.trim()
                        .replaceAll(
                                "\\s+",
                                " "
                        );

        for (int start = 0;
             start < normalized.length();
             start += CHUNK_SIZE) {

            int end =
                    Math.min(
                            start + CHUNK_SIZE,
                            normalized.length()
                    );

            String chunk =
                    normalized.substring(
                            start,
                            end
                    ).trim();

            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }
        }

        return chunks;
    }
}