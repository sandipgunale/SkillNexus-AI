package com.careermetric.interview.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "interview_answers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_interview_question",
                        columnNames = {
                                "interview_question_id"
                        }
                )
        }
)
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "interview_question_id",
            nullable = false,
            unique = true
    )
    private InterviewQuestion interviewQuestion;

    @Column(
            name = "answer_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String answerText;

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

    public InterviewQuestion getInterviewQuestion() {
        return interviewQuestion;
    }

    public void setInterviewQuestion(
            InterviewQuestion interviewQuestion
    ) {
        this.interviewQuestion =
                interviewQuestion;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(
            String answerText
    ) {
        this.answerText =
                answerText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}