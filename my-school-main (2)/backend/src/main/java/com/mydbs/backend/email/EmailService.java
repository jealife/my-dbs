package com.mydbs.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails transactionnels.
 * Toutes les méthodes sont @Async pour ne pas bloquer le thread HTTP.
 * Configure via application.properties (spring.mail.*)
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@mydbs.fr}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Email de confirmation de candidature à l'admission */
    @Async
    public void sendAdmissionConfirmation(String to, String applicantName, String applicationNumber) {
        String subject = "[MyDBS] Confirmation de votre candidature #" + applicationNumber;
        String body = String.format(
                "Bonjour %s,%n%n" +
                "Nous avons bien reçu votre candidature (référence : %s).%n" +
                "Vous recevrez une réponse dans les prochains jours.%n%n" +
                "Bonne chance !%n%nL'équipe MyDBS",
                applicantName, applicationNumber);
        send(to, subject, body);
    }

    /** Email d'alerte de risque de décrochage — envoyé au responsable pédagogique */
    @Async
    public void sendRiskAlert(String to, String studentName, String alertType, double observedValue) {
        String subject = String.format("[MyDBS] ⚠️ Alerte %s — %s", alertType, studentName);
        String body = String.format(
                "Bonjour,%n%n" +
                "Une alerte de type %s a été déclenchée pour l'étudiant(e) %s.%n" +
                "Valeur observée : %.1f%n%n" +
                "Veuillez vous connecter à MyDBS pour consulter le détail et prendre en charge cette alerte.%n%n" +
                "Cordialement,%nL'équipe MyDBS",
                alertType, studentName, observedValue);
        send(to, subject, body);
    }

    /** Email de notification de publication du bulletin */
    @Async
    public void sendBulletinPublished(String to, String studentName, String semester) {
        String subject = "[MyDBS] Votre bulletin du semestre " + semester + " est disponible";
        String body = String.format(
                "Bonjour %s,%n%n" +
                "Votre bulletin de notes du semestre %s vient d'être publié.%n" +
                "Connectez-vous sur MyDBS pour le consulter et le télécharger.%n%n" +
                "Cordialement,%nL'équipe MyDBS",
                studentName, semester);
        send(to, subject, body);
    }

    /** Email de notification d'émission d'une facture */
    @Async
    public void sendInvoiceCreated(String to, String studentName, String invoiceNumber, double amount) {
        String subject = "[MyDBS] Nouvelle facture #" + invoiceNumber;
        String body = String.format(
                "Bonjour %s,%n%n" +
                "Une nouvelle facture a été émise pour votre compte.%n" +
                "Référence : %s | Montant : %.2f EUR%n%n" +
                "Connectez-vous sur MyDBS pour consulter et régler cette facture.%n%n" +
                "Cordialement,%nL'équipe MyDBS",
                studentName, invoiceNumber, amount);
        send(to, subject, body);
    }

    /** Badge attribué */
    @Async
    public void sendBadgeAwarded(String to, String studentName, String badgeTitle) {
        String subject = "[MyDBS] 🏆 Nouveau badge obtenu : " + badgeTitle;
        String body = String.format(
                "Félicitations %s !%n%n" +
                "Vous venez d'obtenir le badge \"%s\".%n" +
                "Consultez votre profil MyDBS pour voir tous vos badges.%n%n" +
                "L'équipe MyDBS",
                studentName, badgeTitle);
        send(to, subject, body);
    }

    // ── PRIVATE ───────────────────────────────────────────────────────────────

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email envoyé à {} : {}", to, subject);
        } catch (Exception e) {
            log.error("Échec envoi email à {} — {} : {}", to, subject, e.getMessage());
        }
    }
}
