package com.careermetric.skill.entity;

import com.careermetric.auth.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "preparation_plans",
        indexes = {
                @Index(
                        name = "idx_preparation_plans_user_id",
                        columnList = "user_id"
                )
        }
)
public class PreparationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(
            nullable = false,
            length = 150
    )
    private String title;

    @Column(
            columnDefinition = "TEXT"
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private PreparationPlanStatus status;

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

    @OneToMany(
            mappedBy = "plan",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PreparationPlanItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = PreparationPlanStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PreparationPlan() {
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PreparationPlanStatus getStatus() {
        return status;
    }

    public void setStatus(PreparationPlanStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<PreparationPlanItem> getItems() {
        return items;
    }

    public void setItems(List<PreparationPlanItem> items) {
        this.items = items;
    }
}