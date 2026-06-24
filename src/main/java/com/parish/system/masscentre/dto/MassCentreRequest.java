package com.parish.system.masscentre.dto;

import jakarta.validation.constraints.NotBlank;

public record MassCentreRequest(@NotBlank String name, String location) {
}
