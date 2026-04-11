package com.mydbs.backend.notification.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.notification.dto.NotificationResponse;
import com.mydbs.backend.notification.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<NotificationResponse>> getNotifications(@PathVariable Long userId) {
        return ApiResponse.success("Notifications recuperees", notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count/{userId}")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        return ApiResponse.success("Compte non lus", notificationService.countUnread(userId));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ApiResponse.success("Notification lue", null);
    }

    @PatchMapping("/user/{userId}/read-all")
    public ApiResponse<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.success("Toutes les notifications lues", null);
    }

    @PostMapping("/request-info/{userId}")
    public ApiResponse<Void> requestAccountInfo(@PathVariable Long userId) {
        notificationService.requestAccountInfo(userId);
        return ApiResponse.success("Demande d'informations envoyee", null);
    }

    @PostMapping("/send-credentials")
    public ApiResponse<Void> sendCredentials(@RequestParam String identifier) {
        notificationService.sendCredentials(identifier);
        return ApiResponse.success("Identifiants envoyés avec succès", null);
    }
}
