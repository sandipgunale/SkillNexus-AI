package com.careermetric.resume.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.careermetric.resume.dto.ResumeRecommendationData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(
        name = "resume_analyses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_resume_analysis_resume",
                        columnNames = "resume_id"
                )
        }
)
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "resume_id",
            nullable = false,
            unique = true
    )
    private Resume resume;

    @Column(name = "overall_score")
    private Integer overallScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "score_breakdown", columnDefinition = "json")
    private Map<String, Integer> scoreBreakdown;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> strengths;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> weaknesses;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "missing_elements", columnDefinition = "json")
    private List<String> missingElements;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> suggestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations", columnDefinition = "json")
    private List<ResumeRecommendationData> recommendations;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Map<String, Object> sections;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Map<String, Integer> getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(Map<String, Integer> scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<String> getMissingElements() {
        return missingElements;
    }

    public void setMissingElements(List<String> missingElements) {
        this.missingElements = missingElements;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<ResumeRecommendationData> getRecommendations() {
         return recommendations;
    }

    public void setRecommendations(
        List<ResumeRecommendationData> recommendations
) {
    this.recommendations = recommendations;
}

    public Map<String, Object> getSections() {
        return sections;
    }

    public void setSections(Map<String, Object> sections) {
        this.sections = sections;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}