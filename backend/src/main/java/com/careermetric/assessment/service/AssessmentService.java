package com.careermetric.assessment.service;

import com.careermetric.assessment.dto.AssessmentAttemptResponse;
import com.careermetric.assessment.dto.AssessmentDetailResponse;
import com.careermetric.assessment.dto.AssessmentResponse;
import com.careermetric.assessment.dto.AssessmentResultResponse;
import com.careermetric.assessment.dto.CreateAssessmentRequest;
import com.careermetric.assessment.dto.SubmitAnswerRequest;

import java.util.List;

public interface AssessmentService {

    AssessmentResponse createAssessment(
            CreateAssessmentRequest request
    );

    List<AssessmentResponse> getMyAssessments();

    AssessmentDetailResponse getMyAssessment(
            Long assessmentId
    );

    AssessmentAttemptResponse startAttempt(
        Long assessmentId
);

AssessmentAttemptResponse submitAnswer(
        Long assessmentId,
        Long attemptId,
        SubmitAnswerRequest request
);

AssessmentResultResponse submitAssessment(
        Long assessmentId,
        Long attemptId
);

AssessmentResultResponse getAssessmentResult(
        Long assessmentId,
        Long attemptId
);
}