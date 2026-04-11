package com.mydbs.backend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI backendOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("MyDBS Backend API")
                        .description("API backend de la plateforme academique MyDBS")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("MyDBS Backend Team")
                                .email("tech@mydbs.com")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project documentation")
                        .url("https://mydbs.local/docs"));
    }
}