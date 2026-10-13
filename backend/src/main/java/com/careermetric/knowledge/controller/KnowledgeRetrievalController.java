package com.careermetric.knowledge.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.knowledge.service.KnowledgeRetrievalService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/knowledge/search")
@SecurityRequirement(name = "bearerAuth")
public class KnowledgeRetrievalController {

    private final KnowledgeRetrievalService retrievalService;

    public KnowledgeRetrievalController(
            KnowledgeRetrievalService retrievalService
    ) {
        this.retrievalService = retrievalService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Document>>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "3") int topK
    ) {

        if (topK < 1 || topK > 10) {
            throw new IllegalArgumentException(
                    "topK must be between 1 and 10"
            );
        }

        List<Document> results =
                retrievalService.search(
                        query,
                        topK
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Knowledge retrieved successfully",
                        results,
                        LocalDateTime.now()
                )
        );
    }
}