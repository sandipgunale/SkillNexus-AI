package com.careermetric.assessment.entity;

import com.careermetric.auth.entity.User;
import com.careermetric.skill.entity.Technology;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "technology_id",
            nullable = false
    )
    private Technology technology;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssessmentDifficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssessmentStatus status;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Technology getTechnology() {
        return technology;
    }

    public void setTechnology(
            Technology technology
    ) {
        this.technology = technology;
    }

    public AssessmentDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(
            AssessmentDifficulty difficulty
    ) {
        this.difficulty = difficulty;
    }

    public AssessmentStatus getStatus() {
        return status;
    }

    public void setStatus(
            AssessmentStatus status
    ) {
        this.status = status;
    }

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(
            Integer questionCount
    ) {
        this.questionCount = questionCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}