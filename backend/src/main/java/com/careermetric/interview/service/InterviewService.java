package com.careermetric.interview.service;

import com.careermetric.interview.dto.CreateInterviewRequest;
import com.careermetric.interview.dto.InterviewAnswerResponse;
import com.careermetric.interview.dto.InterviewQuestionResponse;
import com.careermetric.interview.dto.InterviewResponse;
import com.careermetric.interview.dto.InterviewResultResponse;
import com.careermetric.interview.dto.SubmitInterviewAnswerRequest;

import java.util.List;

public interface InterviewService {

    InterviewResponse createInterview(
            CreateInterviewRequest request
    );

    List<InterviewResponse> getMyInterviews();

    InterviewResponse getMyInterview(
            Long interviewId
    );

    List<InterviewQuestionResponse> getInterviewQuestions(
            Long interviewId
    );

    InterviewAnswerResponse submitAnswer(
            Long interviewId,
            SubmitInterviewAnswerRequest request
    );

    InterviewResultResponse completeInterview(
            Long interviewId
    );

    InterviewResultResponse getInterviewResult(
            Long interviewId
    );
}