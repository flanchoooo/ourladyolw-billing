package com.parish.system.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    OpenAPI parishOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Parish Membership, Billing and Receipting API")
                        .description("Backend APIs for member management, billing, receipting, reports and dashboard metrics.")
                        .version("v1")
                        .contact(new Contact().name("Parish System Admin"))
                        .license(new License().name("Private")))
                .addServersItem(new Server().url("/").description("Current backend origin"))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the JWT access token from /api/auth/login.")));
    }
}
