package com.parish.system.section.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SectionRequest(@NotBlank String name, @NotNull Long zoneId) {
}
