package com.mydbs.backend.notification.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.notification.model.*;
import com.mydbs.backend.notification.service.impl.NotificationServiceImpl;
import com.mydbs.backend.notification.sse.SseEmitterRegistry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/communications")
@CrossOrigin(origins = "*")
@Tag(name = "Communication & Notifications", description = "Notifications in-app, annonces, messagerie interne")
public class CommunicationController {

    private final NotificationServiceImpl notificationService;
    private final SseEmitterRegistry sseEmitterRegistry;

    public CommunicationController(NotificationServiceImpl notificationService,
                                   SseEmitterRegistry sseEmitterRegistry) {
        this.notificationService = notificationService;
        this.sseEmitterRegistry = sseEmitterRegistry;
    }

    // ── SSE STREAM ────────────────────────────────────────────────────────

    @GetMapping(value = "/notifications/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Flux SSE temps-réel (text/event-stream) — envoie les notifications dès qu'elles sont créées")
    public SseEmitter streamNotifications(@RequestParam Long userId) {
        return sseEmitterRegistry.createEmitter(userId);
    }

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────

    @GetMapping("/notifications/users/{userId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Boîte de notifications d'un utilisateur (triée par date desc)")
    public ApiResponse<Page<Notification>> getNotifications(
            @PathVariable Long userId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Notifications récupérées",
                notificationService.getUserNotifications(userId, pageable));
    }

    @GetMapping("/notifications/users/{userId}/unread-count")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Nombre de notifications non lues (badge clochette)")
    public ApiResponse<Long> countUnread(@PathVariable Long userId) {
        return ApiResponse.success("Compteur non lues", notificationService.countUnread(userId));
    }

    @PostMapping("/notifications")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Envoyer une notification in-app à un utilisateur")
    public ApiResponse<Notification> push(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "INFO") NotificationType type,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) Long referenceId,
            @RequestParam(required = false) String actionUrl) {
        return ApiResponse.success("Notification envoyée",
                notificationService.push(userId, type, title, message, referenceType, referenceId, actionUrl));
    }

    @PatchMapping("/notifications/{id}/read")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Marquer une notification comme lue")
    public ApiResponse<Notification> markAsRead(@PathVariable Long id) {
        return ApiResponse.success("Notification lue", notificationService.markAsRead(id));
    }

    @PatchMapping("/notifications/users/{userId}/read-all")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Marquer toutes les notifications d'un utilisateur comme lues")
    public ApiResponse<Integer> markAllAsRead(@PathVariable Long userId) {
        return ApiResponse.success("Toutes les notifications lues", notificationService.markAllAsRead(userId));
    }

    // ── ANNONCES ──────────────────────────────────────────────────────────

    @PostMapping("/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Créer une annonce (tableau d'affichage numérique, ciblage par audience)")
    public ApiResponse<Announcement> createAnnouncement(
            @RequestParam Long authorId,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(defaultValue = "ALL") String audience,
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) LocalDateTime publishedAt,
            @RequestParam(required = false) LocalDateTime expiresAt,
            @RequestParam(defaultValue = "false") boolean pinned) {
        return ApiResponse.success("Annonce créée",
                notificationService.createAnnouncement(authorId, title, content, audience,
                        cohortId, academicYearId, publishedAt, expiresAt, pinned));
    }

    @GetMapping("/announcements")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Annonces actives filtrées par audience (pinned en premier)")
    public ApiResponse<Page<Announcement>> getActiveAnnouncements(
            @RequestParam(required = false) String audience,
            @RequestParam(required = false) Long cohortId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Annonces récupérées",
                notificationService.getActiveAnnouncements(audience, cohortId, pageable));
    }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Supprimer une annonce")
    public ApiResponse<Void> deleteAnnouncement(@PathVariable Long id) {
        notificationService.deleteAnnouncement(id);
        return ApiResponse.success("Annonce supprimée", null);
    }

    // ── MESSAGERIE INTERNE ─────────────────────────────────────────────────

    @PostMapping("/messages")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Envoyer un message interne (avec thread optionnel pour réponses)")
    public ApiResponse<Message> sendMessage(
            @RequestParam Long senderId,
            @RequestParam Long recipientId,
            @RequestParam(required = false) String subject,
            @RequestParam String body,
            @RequestParam(required = false) String threadId,
            @RequestParam(required = false) Long parentMessageId) {
        return ApiResponse.success("Message envoyé",
                notificationService.sendMessage(senderId, recipientId, subject, body, threadId, parentMessageId));
    }

    @GetMapping("/messages/inbox/{userId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Boîte de réception")
    public ApiResponse<Page<Message>> getInbox(
            @PathVariable Long userId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Messages reçus", notificationService.getInbox(userId, pageable));
    }

    @GetMapping("/messages/sent/{userId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Messages envoyés")
    public ApiResponse<Page<Message>> getSent(
            @PathVariable Long userId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Messages envoyés", notificationService.getSent(userId, pageable));
    }

    @GetMapping("/messages/thread/{threadId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Fil de conversation (thread)")
    public ApiResponse<Page<Message>> getThread(
            @PathVariable String threadId, @PageableDefault(size = 50) Pageable pageable) {
        return ApiResponse.success("Conversation récupérée", notificationService.getThread(threadId, pageable));
    }

    @GetMapping("/messages/users/{userId}/unread-count")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Nombre de messages non lus")
    public ApiResponse<Long> countUnreadMessages(@PathVariable Long userId) {
        return ApiResponse.success("Messages non lus", notificationService.countUnreadMessages(userId));
    }

    @PatchMapping("/messages/{messageId}/read")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Marquer un message comme lu")
    public ApiResponse<Message> readMessage(@PathVariable Long messageId, @RequestParam Long userId) {
        return ApiResponse.success("Message lu", notificationService.readMessage(messageId, userId));
    }
}
