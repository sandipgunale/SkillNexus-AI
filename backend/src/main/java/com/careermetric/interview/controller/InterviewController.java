package com.careermetric.interview.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.interview.dto.CreateInterviewRequest;
import com.careermetric.interview.dto.InterviewAnswerResponse;
import com.careermetric.interview.dto.InterviewQuestionResponse;
import com.careermetric.interview.dto.InterviewResponse;
import com.careermetric.interview.dto.InterviewResultResponse;
import com.careermetric.interview.dto.SubmitInterviewAnswerRequest;
import com.careermetric.interview.service.InterviewService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@SecurityRequirement(name = "bearerAuth")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(
            InterviewService interviewService
    ) {
        this.interviewService =
                interviewService;
    }

    @PostMapping
    public ResponseEntity<
            ApiResponse<InterviewResponse>
            > createInterview(
            @Valid @RequestBody
            CreateInterviewRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interview created successfully",
                        interviewService.createInterview(
                                request
                        )
                )
        );
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<InterviewResponse>>
            > getMyInterviews() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interviews fetched successfully",
                        interviewService.getMyInterviews()
                )
        );
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<
            ApiResponse<InterviewResponse>
            > getMyInterview(
            @PathVariable Long interviewId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interview fetched successfully",
                        interviewService.getMyInterview(
                                interviewId
                        )
                )
        );
    }

    @GetMapping("/{interviewId}/questions")
    public ResponseEntity<
            ApiResponse<List<InterviewQuestionResponse>>
            > getInterviewQuestions(
            @PathVariable Long interviewId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interview questions fetched successfully",
                        interviewService.getInterviewQuestions(
                                interviewId
                        )
                )
        );
    }

    @PostMapping("/{interviewId}/answers")
    public ResponseEntity<
            ApiResponse<InterviewAnswerResponse>
            > submitAnswer(
            @PathVariable Long interviewId,
            @Valid @RequestBody
            SubmitInterviewAnswerRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interview answer submitted successfully",
                        interviewService.submitAnswer(
                                interviewId,
                                request
                        )
                )
        );
    }

    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<
            ApiResponse<InterviewResultResponse>
            > completeInterview(
            @PathVariable Long interviewId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interview completed successfully",
                        interviewService.completeInterview(
                                interviewId
                        )
                )
        );
    }

    @GetMapping("/{interviewId}/result")
    public ResponseEntity<
            ApiResponse<InterviewResultResponse>
            > getInterviewResult(
            @PathVariable Long interviewId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interview result fetched successfully",
                        interviewService.getInterviewResult(
                                interviewId
                        )
                )
        );
    }
}