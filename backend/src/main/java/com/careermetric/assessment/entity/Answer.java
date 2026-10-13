package com.careermetric.assessment.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "answers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_attempt_question",
                        columnNames = {
                                "attempt_id",
                                "question_id"
                        }
                )
        }
)
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "attempt_id",
            nullable = false
    )
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "question_id",
            nullable = false
    )
    private Question question;

    @Column(
            name = "selected_answer",
            columnDefinition = "TEXT"
    )
    private String selectedAnswer;

    @Column(
            name = "is_correct",
            nullable = false
    )
    private Boolean correct;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        createdAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AssessmentAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(
            AssessmentAttempt attempt
    ) {
        this.attempt = attempt;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(
            Question question
    ) {
        this.question = question;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(
            String selectedAnswer
    ) {
        this.selectedAnswer = selectedAnswer;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(
            Boolean correct
    ) {
        this.correct = correct;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}