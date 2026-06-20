package com.eduflow.service;

import com.eduflow.domain.Role;
import com.eduflow.domain.User;
import com.eduflow.dto.LoginRequest;
import com.eduflow.dto.RegisterRequest;
import com.eduflow.dto.TokenResponse;
import com.eduflow.dto.UserDTO;
import com.eduflow.exception.DuplicateResourceException;
import com.eduflow.exception.ResourceNotFoundException;
import com.eduflow.repository.UserRepository;
import com.eduflow.security.JwtBlacklist;
import com.eduflow.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private JwtBlacklist jwtBlacklist;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private User user;

    @BeforeEach
    public void setUp() {
        registerRequest = new RegisterRequest("new@eduflow.com", "password", "New User", Role.STUDENT);
        user = User.builder()
                .id(1L)
                .email("new@eduflow.com")
                .fullName("New User")
                .role(Role.STUDENT)
                .active(true)
                .build();
    }

    @Test
    public void testRegisterHappyPath() {
        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDTO result = authService.register(registerRequest);

        assertThat(result.email()).isEqualTo("new@eduflow.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    public void testRegisterDuplicateEmailThrowsException() {
        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testLoginHappyPath() {
        LoginRequest loginRequest = new LoginRequest("new@eduflow.com", "password");
        when(userRepository.findByEmail("new@eduflow.com")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken("new@eduflow.com", Role.STUDENT)).thenReturn("token");
        when(jwtUtils.getExpiryDateTime("token")).thenReturn(java.time.LocalDateTime.now().plusDays(1));

        TokenResponse result = authService.login(loginRequest);

        assertThat(result.token()).isEqualTo("token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    public void testLoginBadCredentialsThrowsException() {
        LoginRequest loginRequest = new LoginRequest("new@eduflow.com", "wrong");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }
}
