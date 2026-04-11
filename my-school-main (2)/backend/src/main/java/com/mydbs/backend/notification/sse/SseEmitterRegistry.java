package com.mydbs.backend.notification.sse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registre thread-safe des connexions SSE actives.
 * Chaque utilisateur connecté via GET /notifications/stream
 * dispose d'un SseEmitter associé à son userId.
 */
@Component
public class SseEmitterRegistry {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterRegistry.class);
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    /** Crée et enregistre un nouvel émetteur pour l'utilisateur */
    public SseEmitter createEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        emitter.onCompletion(() -> {
            emitters.remove(userId);
            log.info("SSE connexion terminée pour userId={}", userId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(userId);
            emitter.complete();
            log.info("SSE timeout pour userId={}", userId);
        });
        emitter.onError(e -> {
            emitters.remove(userId);
            log.warn("SSE erreur pour userId={}: {}", userId, e.getMessage());
        });

        emitters.put(userId, emitter);
        log.info("SSE connexion ouverte pour userId={}", userId);
        try {
            emitter.send(SseEmitter.event().name("CONNECT").data("OK"));
        } catch (IOException e) {
            log.warn("Impossible d'envoyer l'event CONNECT initial");
        }
        return emitter;
    }

    /**
     * Envoie un événement SSE à un utilisateur spécifique.
     * Si l'utilisateur n'est pas connecté, ignore silencieusement.
     */
    public void sendToUser(Long userId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) return;
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(data));
        } catch (IOException e) {
            emitters.remove(userId);
            log.warn("SSE envoi échoué pour userId={}, connexion supprimée", userId);
        }
    }

    /** Diffuse un événement à tous les utilisateurs connectés (broadcast) */
    public void broadcast(String eventName, Object data) {
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        });
    }

    public int countConnected() {
        return emitters.size();
    }
}
