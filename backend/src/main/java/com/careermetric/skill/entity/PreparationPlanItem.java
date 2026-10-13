package com.careermetric.skill.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "preparation_plan_items",
        indexes = {
                @Index(
                        name = "idx_preparation_items_plan_id",
                        columnList = "plan_id"
                )
        }
)
public class PreparationPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "plan_id",
            nullable = false
    )
    private PreparationPlan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "technology_id"
    )
    private Technology technology;

    @Column(
            nullable = false,
            length = 150
    )
    private String skill;

    @Column(
            nullable = false,
            length = 20
    )
    private String priority;

    @Column(
            columnDefinition = "TEXT"
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private PreparationItemStatus status;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = PreparationItemStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PreparationPlanItem() {
    }

    public Long getId() {
        return id;
    }

    public PreparationPlan getPlan() {
        return plan;
    }

    public void setPlan(PreparationPlan plan) {
        this.plan = plan;
    }

    public Technology getTechnology() {
        return technology;
    }

    public void setTechnology(Technology technology) {
        this.technology = technology;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PreparationItemStatus getStatus() {
        return status;
    }

    public void setStatus(PreparationItemStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}