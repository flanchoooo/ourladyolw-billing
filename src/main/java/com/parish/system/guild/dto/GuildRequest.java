package com.parish.system.guild.dto;

import jakarta.validation.constraints.NotBlank;

public record GuildRequest(@NotBlank String name, String description) {
}
