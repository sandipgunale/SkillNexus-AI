package com.careermetric.ai.rag;

import com.careermetric.ai.rag.dto.RagResponse;
import com.careermetric.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/rag")
@SecurityRequirement(name = "bearerAuth")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @GetMapping("/ask")
    public ResponseEntity<ApiResponse<RagResponse>> ask(
            @RequestParam String question,
            @RequestParam String conversationId,
            @RequestParam(required = false) String topic) {

        RagResponse response;

        if (topic == null || topic.isBlank()) {

            response = ragService.ask(
                    question,
                    conversationId
            );

        } else {

            response = ragService.ask(
                    question,
                    topic,
                    conversationId
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "RAG answer generated successfully",
                        response,
                        LocalDateTime.now()
                )
        );
    }
}