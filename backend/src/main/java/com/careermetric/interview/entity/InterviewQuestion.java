package com.careermetric.interview.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "interview_session_id",
            nullable = false
    )
    private InterviewSession interviewSession;

    @Column(
            name = "question_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String questionText;

    @Column(
            name = "question_number",
            nullable = false
    )
    private Integer questionNumber;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        createdAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public InterviewSession getInterviewSession() {
        return interviewSession;
    }

    public void setInterviewSession(
            InterviewSession interviewSession
    ) {
        this.interviewSession =
                interviewSession;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(
            String questionText
    ) {
        this.questionText =
                questionText;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(
            Integer questionNumber
    ) {
        this.questionNumber =
                questionNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}