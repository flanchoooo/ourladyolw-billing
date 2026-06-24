package com.parish.system.ministry.dto;

import jakarta.validation.constraints.NotBlank;

public record MinistryRequest(@NotBlank String name, String description) {
}
