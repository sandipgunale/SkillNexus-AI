package com.careermetric.assessment.controller;

import com.careermetric.assessment.dto.AssessmentAttemptResponse;
import com.careermetric.assessment.dto.AssessmentDetailResponse;
import com.careermetric.assessment.dto.AssessmentResponse;
import com.careermetric.assessment.dto.AssessmentResultResponse;
import com.careermetric.assessment.dto.CreateAssessmentRequest;
import com.careermetric.assessment.dto.SubmitAnswerRequest;
import com.careermetric.assessment.service.AssessmentService;
import com.careermetric.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@SecurityRequirement(name = "bearerAuth")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService
    ) {
        this.assessmentService =
                assessmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssessmentResponse>>
    createAssessment(
            @Valid
            @RequestBody
            CreateAssessmentRequest request
    ) {

        AssessmentResponse assessment =
                assessmentService.createAssessment(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Assessment created successfully",
                                assessment
                        )
                );
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<AssessmentResponse>>
            >
    getMyAssessments() {

        List<AssessmentResponse> assessments =
                assessmentService.getMyAssessments();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Assessments fetched successfully",
                        assessments
                )
        );
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<
            ApiResponse<AssessmentDetailResponse>
            >
    getMyAssessment(
            @PathVariable Long assessmentId
    ) {

        AssessmentDetailResponse assessment =
                assessmentService.getMyAssessment(
                        assessmentId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Assessment fetched successfully",
                        assessment
                )
        );
    }

    @PostMapping("/{assessmentId}/attempts")
public ResponseEntity<
        ApiResponse<AssessmentAttemptResponse>
        > startAttempt(
        @PathVariable Long assessmentId
) {

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Assessment attempt started",
                    assessmentService.startAttempt(
                            assessmentId
                    )
            )
    );
}

@PostMapping(
        "/{assessmentId}/attempts/{attemptId}/answers"
)
public ResponseEntity<
        ApiResponse<AssessmentAttemptResponse>
        > submitAnswer(
        @PathVariable Long assessmentId,
        @PathVariable Long attemptId,
        @Valid @RequestBody SubmitAnswerRequest request
) {

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Answer submitted",
                    assessmentService.submitAnswer(
                            assessmentId,
                            attemptId,
                            request
                    )
            )
    );
}

@PostMapping(
        "/{assessmentId}/attempts/{attemptId}/submit"
)
public ResponseEntity<
        ApiResponse<AssessmentResultResponse>
        > submitAssessment(
        @PathVariable Long assessmentId,
        @PathVariable Long attemptId
) {

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Assessment submitted successfully",
                    assessmentService.submitAssessment(
                            assessmentId,
                            attemptId
                    )
            )
    );
}

@GetMapping(
        "/{assessmentId}/attempts/{attemptId}/result"
)
public ResponseEntity<
        ApiResponse<AssessmentResultResponse>
        > getAssessmentResult(
        @PathVariable Long assessmentId,
        @PathVariable Long attemptId
) {

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Assessment result fetched successfully",
                    assessmentService.getAssessmentResult(
                            assessmentId,
                            attemptId
                    )
            )
    );
}
}