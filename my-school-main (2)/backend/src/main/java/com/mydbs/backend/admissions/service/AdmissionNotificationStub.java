package com.mydbs.backend.admissions.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Stub du service de notification.
 * Les vraies implémentations (email, SMS, push) seront ajoutées
 * lors de l'implémentation du module Communication (Itération 8).
 */
@Service
public class AdmissionNotificationStub {

    private static final Logger log = LoggerFactory.getLogger(AdmissionNotificationStub.class);

    public void notifyStatusChange(String email, String firstName, String newStatus) {
        log.info("[NOTIFICATION-STUB] Email à envoyer à {} ({}) : statut candidature -> {}", email, firstName, newStatus);
    }

    public void notifyApplicationReceived(String email, String firstName, String applicationNumber) {
        log.info("[NOTIFICATION-STUB] Email à envoyer à {} ({}) : candidature {} reçue", email, firstName, applicationNumber);
    }
}
