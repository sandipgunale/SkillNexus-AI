package com.careermetric.ai.controller;

import com.careermetric.ai.service.EmbeddingService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.ai.document.Document;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-debug")
@SecurityRequirement(name = "bearerAuth")
public class SemanticDebugController {

    private final EmbeddingService embeddingService;

    public SemanticDebugController(
            EmbeddingService embeddingService
    ) {
        this.embeddingService = embeddingService;
    }

    @GetMapping("/search")
    public List<SemanticDebugResponse> search(
            @RequestParam String query,
            @RequestParam Long resumeId
    ) {

        String filterExpression =
                "entityType == 'RESUME' && resumeId == " + resumeId;

        List<Document> documents =
                embeddingService.search(
                        query,
                        5,
                        filterExpression
                );

        return documents.stream()
                .map(document ->
                        new SemanticDebugResponse(
                                document.getScore(),
                                document.getText(),
                                document.getMetadata()
                        )
                )
                .toList();
    }

    public record SemanticDebugResponse(
            Double score,
            String text,
            java.util.Map<String, Object> metadata
    ) {
    }
}