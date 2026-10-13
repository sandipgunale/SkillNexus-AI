package com.careermetric.skill.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.skill.dto.ReadinessResponse;
import com.careermetric.skill.dto.SkillProgressResponse;
import com.careermetric.skill.service.SkillProgressService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.constraints.Positive;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-progress")
@SecurityRequirement(name = "bearerAuth")
public class SkillProgressController {

    private final SkillProgressService skillProgressService;

    public SkillProgressController(
            SkillProgressService skillProgressService
    ) {
        this.skillProgressService = skillProgressService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SkillProgressResponse>>>
    getCurrentUserProgress() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Skill progress retrieved successfully",
                        skillProgressService.getCurrentUserProgress()
                )
        );
    }

    @GetMapping("/readiness")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReadinessResponse>>
    getReadiness() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Readiness score retrieved successfully",
                        skillProgressService.getCurrentUserReadiness()
                )
        );
    }

    @GetMapping("/{technologyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SkillProgressResponse>>
    getCurrentUserProgressForTechnology(
            @PathVariable
            @Positive(message = "Technology ID must be positive")
            Long technologyId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Skill progress retrieved successfully",
                        skillProgressService
                                .getCurrentUserProgressForTechnology(
                                        technologyId
                                )
                )
        );
    }

    @PostMapping("/{technologyId}/recalculate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SkillProgressResponse>>
    recalculateProgress(
            @PathVariable
            @Positive(message = "Technology ID must be positive")
            Long technologyId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Skill progress recalculated successfully",
                        skillProgressService.recalculateProgress(
                                technologyId
                        )
                )
        );
    }
}