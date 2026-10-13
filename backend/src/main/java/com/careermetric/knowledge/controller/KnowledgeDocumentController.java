package com.careermetric.knowledge.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.knowledge.entity.KnowledgeDocument;
import com.careermetric.knowledge.service.KnowledgeDocumentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
@SecurityRequirement(name = "bearerAuth")
public class KnowledgeDocumentController {

    private final KnowledgeDocumentService knowledgeDocumentService;

    public KnowledgeDocumentController(
            KnowledgeDocumentService knowledgeDocumentService
    ) {
        this.knowledgeDocumentService =
                knowledgeDocumentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeDocument>> create(
            @RequestParam String title,
            @RequestParam String topic,
            @RequestBody String sourceText
    ) {

        KnowledgeDocument document =
                knowledgeDocumentService.create(
                        title,
                        topic,
                        sourceText
                );

        ApiResponse<KnowledgeDocument> response =
                new ApiResponse<>(
                        true,
                        "Knowledge document created and indexed successfully",
                        document,
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> findAll() {

        List<KnowledgeDocument> documents =
                knowledgeDocumentService.findAll();

        ApiResponse<List<KnowledgeDocument>> response =
                new ApiResponse<>(
                        true,
                        "Knowledge documents fetched successfully",
                        documents,
                        LocalDateTime.now()
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> findById(
            @PathVariable Long id
    ) {

        KnowledgeDocument document =
                knowledgeDocumentService.findById(id);

        ApiResponse<KnowledgeDocument> response =
                new ApiResponse<>(
                        true,
                        "Knowledge document fetched successfully",
                        document,
                        LocalDateTime.now()
                );

        return ResponseEntity.ok(response);
    }
}