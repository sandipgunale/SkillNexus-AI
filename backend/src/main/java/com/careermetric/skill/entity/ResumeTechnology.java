package com.careermetric.skill.entity;

import com.careermetric.resume.entity.Resume;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "resume_technologies",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_resume_technology",
                        columnNames = {
                                "resume_id",
                                "technology_id"
                        }
                )
        }
)
public class ResumeTechnology {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "resume_id",
            nullable = false
    )
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "technology_id",
            nullable = false
    )
    private Technology technology;

    @Column(
            columnDefinition = "TEXT"
    )
    private String evidence;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Resume getResume() {
        return resume;
    }

    public Technology getTechnology() {
        return technology;
    }

    public String getEvidence() {
        return evidence;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public void setTechnology(Technology technology) {
        this.technology = technology;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}