package com.parish.system.zone.dto;

import jakarta.validation.constraints.NotBlank;

public record ZoneRequest(@NotBlank String name, String leaderName, String leaderPhone) {
}
