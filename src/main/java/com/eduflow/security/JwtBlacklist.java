package com.eduflow.security;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory JWT blacklist keyed by JTI (JWT ID).
 * Tokens are invalidated on logout and rejected by JwtAuthFilter.
 * Note: resets on app restart — suitable for single-instance deployment.
 */
@Component
public class JwtBlacklist {

    private final Set<String> blacklistedJtis = ConcurrentHashMap.newKeySet();

    public void blacklist(String jti) {
        blacklistedJtis.add(jti);
    }

    public boolean isBlacklisted(String jti) {
        return blacklistedJtis.contains(jti);
    }
}
