package com.careermetric.skill.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.skill.dto.CreatePreparationPlanRequest;
import com.careermetric.skill.dto.PreparationPlanResponse;
import com.careermetric.skill.dto.UpdatePreparationItemStatusRequest;
import com.careermetric.skill.service.PreparationPlanService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/preparation-plans")
@SecurityRequirement(name = "bearerAuth")
public class PreparationPlanController {

    private final PreparationPlanService preparationPlanService;

    public PreparationPlanController(
            PreparationPlanService preparationPlanService
    ) {
        this.preparationPlanService = preparationPlanService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PreparationPlanResponse>> createPlan(
            @Valid @RequestBody CreatePreparationPlanRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preparation plan created successfully",
                        preparationPlanService.createPlan(request)
                )
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PreparationPlanResponse>>>
    getCurrentUserPlans() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preparation plans retrieved successfully",
                        preparationPlanService.getCurrentUserPlans()
                )
        );
    }

    @GetMapping("/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PreparationPlanResponse>>
    generatePlan(
            @RequestParam
            @Positive(message = "Resume ID must be positive")
            Long resumeId,

            @RequestParam
            @Positive(message = "Job description ID must be positive")
            Long jobDescriptionId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preparation plan generated successfully",
                        preparationPlanService.generatePlanFromJobMatch(
                                resumeId,
                                jobDescriptionId
                        )
                )
        );
    }

    @GetMapping("/{planId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PreparationPlanResponse>>
    getPlan(
            @PathVariable
            @Positive(message = "Plan ID must be positive")
            Long planId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preparation plan retrieved successfully",
                        preparationPlanService.getCurrentUserPlan(planId)
                )
        );
    }

    @PatchMapping("/{planId}/activate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PreparationPlanResponse>>
    activatePlan(
            @PathVariable
            @Positive(message = "Plan ID must be positive")
            Long planId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preparation plan activated successfully",
                        preparationPlanService.activatePlan(planId)
                )
        );
    }

    @PatchMapping("/{planId}/items/{itemId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PreparationPlanResponse>>
    updateItemStatus(
            @PathVariable
            @Positive(message = "Plan ID must be positive")
            Long planId,

            @PathVariable
            @Positive(message = "Item ID must be positive")
            Long itemId,

            @Valid @RequestBody
            UpdatePreparationItemStatusRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preparation item status updated successfully",
                        preparationPlanService.updateItemStatus(
                                planId,
                                itemId,
                                request
                        )
                )
        );
    }
}