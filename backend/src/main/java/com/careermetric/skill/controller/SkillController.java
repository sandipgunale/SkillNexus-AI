package com.careermetric.skill.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.skill.dto.SkillDashboardResponse;
import com.careermetric.skill.dto.SkillResponse;
import com.careermetric.skill.service.SkillService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@SecurityRequirement(name = "bearerAuth")
public class SkillController {

    private final SkillService skillService;

    public SkillController(
            SkillService skillService
    ) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillResponse>>>
    getMySkills() {

        List<SkillResponse> skills =
                skillService.getMySkills();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Skills fetched successfully",
                        skills
                )
        );
    }

    @GetMapping("/{technologyId}")
    public ResponseEntity<ApiResponse<SkillResponse>>
    getMySkill(
            @PathVariable Long technologyId
    ) {

        SkillResponse skill =
                skillService.getMySkill(
                        technologyId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Skill fetched successfully",
                        skill
                )
        );
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SkillDashboardResponse>>
    getMySkillDashboard() {

        SkillDashboardResponse dashboard =
                skillService.getMySkillDashboard();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Skill dashboard fetched successfully",
                        dashboard
                )
        );
    }
}