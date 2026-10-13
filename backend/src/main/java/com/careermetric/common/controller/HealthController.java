package com.careermetric.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@Tag(
        name = "Health",
        description = "Application health endpoints"
)
public class HealthController {

    @GetMapping
    @Operation(
            summary = "Check backend health",
            description = "Returns the current backend availability status"
    )
    public String health() {
        return "SkillNexus AI backend is running";
    }
}