
package com.example.whatsappdemo.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.whatsappdemo.enums.Gender;
import com.example.whatsappdemo.enums.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users", indexes = {
        @Index(columnList = "email", name = "idx_users_email"),
        @Index(columnList = "phone", name = "idx_users_phone")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User  implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = true, unique = true, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @NotBlank
    @Column(nullable = false)
    private String password; // stored hashed

    @Enumerated(EnumType.STRING)
     @Column(nullable = false, length = 20)
    private UserRole role;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

  @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(() -> "ROLE_" + role.name());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
