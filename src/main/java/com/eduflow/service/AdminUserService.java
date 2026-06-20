package com.eduflow.service;

import com.eduflow.domain.Role;
import com.eduflow.domain.User;
import com.eduflow.dto.AdminUpdateUserRequest;
import com.eduflow.dto.UserDTO;
import com.eduflow.exception.ResourceNotFoundException;
import com.eduflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<UserDTO> listUsers(Role role, Boolean active, Pageable pageable) {
        Specification<User> spec = buildSpec(role, active);
        return userRepository.findAll(spec, pageable).map(AuthService::toDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserDTO updateUser(Long id, AdminUpdateUserRequest request) {
        User user = findOrThrow(id);
        if (request.role() != null)   user.setRole(request.role());
        if (request.active() != null) user.setActive(request.active());
        return AuthService.toDTO(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private Specification<User> buildSpec(Role role, Boolean active) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (role != null)   predicates.add(cb.equal(root.get("role"), role));
            if (active != null) predicates.add(cb.equal(root.get("active"), active));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
