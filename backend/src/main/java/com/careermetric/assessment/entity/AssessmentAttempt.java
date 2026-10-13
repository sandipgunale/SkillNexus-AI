package com.careermetric.assessment.entity;

import com.careermetric.auth.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_attempts")
public class AssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "assessment_id",
            nullable = false
    )
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private AttemptStatus status;

    @Column
    private Integer score;

    @Column(name = "correct_answers")
    private Integer correctAnswers;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {

        startedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(
            Assessment assessment
    ) {
        this.assessment = assessment;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user = user;
    }

    public AttemptStatus getStatus() {
        return status;
    }

    public void setStatus(
            AttemptStatus status
    ) {
        this.status = status;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(
            Integer score
    ) {
        this.score = score;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(
            Integer correctAnswers
    ) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(
            Integer totalQuestions
    ) {
        this.totalQuestions = totalQuestions;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(
            LocalDateTime completedAt
    ) {
        this.completedAt = completedAt;
    }
}