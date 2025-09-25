package com.example.whatsappdemo.scuirty.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiration = expiration;
    }

    // ✅ توليد توكن مع claims إضافية (مثلاً role)
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // نضيف الـ role كـ claim
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ استخراج username من التوكن
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ استخراج role من التوكن
    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    // ✅ التحقق من صلاحية التوكن
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("❌ Token expired");
        } catch (UnsupportedJwtException e) {
            System.out.println("❌ Unsupported JWT");
        } catch (MalformedJwtException e) {
            System.out.println("❌ Malformed JWT");
        } catch (SecurityException e) { // ✅ بديل SignatureException
            System.out.println("❌ Invalid JWT signature");
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Illegal argument");
        }
        return false;
    }

    // ✅ دالة مشتركة لاستخراج الـ claims
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
