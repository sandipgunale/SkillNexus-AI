package com.careermetric.skill.dto;

import com.careermetric.skill.entity.PreparationItemStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePreparationItemStatusRequest(

        @NotNull(message = "Status is required")
        PreparationItemStatus status
) {
}