package com.mydbs.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test de fumée : vérifie que le contexte Spring Boot démarre sans erreur.
 * Nécessite une base de données configurée dans application-local.properties.
 *
 * Pour les tests d'intégration complets avec Testcontainers MySQL, installez
 * Docker Desktop puis créez des classes héritant de ce test avec :
 * @Testcontainers
 * @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
 */
@SpringBootTest
@ActiveProfiles("local")
class BackendApplicationTests {

    @Test
    void contextLoads() {
        // Vérifie que le contexte Spring boot démarre correctement
        // avec tous les modules 1-18 présents.
    }
}
