package com.careermetric.interview.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_evaluations")
public class InterviewEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "interview_answer_id",
            nullable = false,
            unique = true
    )
    private InterviewAnswer interviewAnswer;

    @Column
    private Integer score;

    @Column(
            columnDefinition = "TEXT"
    )
    private String feedback;

    @Column(
            name = "strengths",
            columnDefinition = "json"
    )
    private String strengths;

    @Column(
            name = "improvements",
            columnDefinition = "json"
    )
    private String improvements;

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

    public InterviewAnswer getInterviewAnswer() {
        return interviewAnswer;
    }

    public void setInterviewAnswer(
            InterviewAnswer interviewAnswer
    ) {
        this.interviewAnswer =
                interviewAnswer;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getImprovements() {
        return improvements;
    }

    public void setImprovements(
            String improvements
    ) {
        this.improvements = improvements;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}