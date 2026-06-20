package com.eduflow.controller;

import com.eduflow.domain.Role;
import com.eduflow.dto.AdminUpdateUserRequest;
import com.eduflow.dto.UserDTO;
import com.eduflow.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin — User Management", description = "Admin-only user operations")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @Operation(summary = "List all users (filterable by role and active status)")
    public ResponseEntity<Page<UserDTO>> listUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(adminUserService.listUsers(role, active, pageable));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Admin updates a user's role or active status")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Admin hard-deletes a user account")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
