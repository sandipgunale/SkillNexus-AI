package com.careermetric.skill.entity;

import com.careermetric.auth.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "skill_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_skill_progress_user_technology",
                        columnNames = {"user_id", "technology_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_skill_progress_user_id",
                        columnList = "user_id"
                )
        }
)
public class SkillProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "technology_id", nullable = false)
    private Technology technology;

    @Column(name = "assessment_score")
    private Integer assessmentScore;

    @Column(name = "interview_score")
    private Integer interviewScore;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @PrePersist
    protected void onCreate() {
        lastUpdated = LocalDateTime.now();

        if (overallScore == null) {
            overallScore = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public SkillProgress() {
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

    public void setTechnology(Technology technology) {
        this.technology = technology;
    }

    public Integer getAssessmentScore() {
        return assessmentScore;
    }

    public void setAssessmentScore(Integer assessmentScore) {
        this.assessmentScore = assessmentScore;
    }

    public Integer getInterviewScore() {
        return interviewScore;
    }

    public void setInterviewScore(Integer interviewScore) {
        this.interviewScore = interviewScore;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}