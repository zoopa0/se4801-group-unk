package com.eduflow.config;

import com.eduflow.domain.Role;
import com.eduflow.domain.User;
import com.eduflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@eduflow.com")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@eduflow.com")
                    .passwordHash(passwordEncoder.encode("adminpassword"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println(">>> DatabaseSeeder: Default admin user seeded successfully (admin@eduflow.com / adminpassword)");
        } else {
            System.out.println(">>> DatabaseSeeder: Default admin user already exists");
        }
    }
}
