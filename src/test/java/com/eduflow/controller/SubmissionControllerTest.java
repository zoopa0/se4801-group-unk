package com.eduflow.controller;

import com.eduflow.domain.SubmissionStatus;
import com.eduflow.dto.SubmissionDTO;
import com.eduflow.dto.SubmitRequest;
import com.eduflow.security.JwtAuthFilter;
import com.eduflow.security.JwtBlacklist;
import com.eduflow.security.JwtUtils;
import com.eduflow.security.SecurityConfig;
import com.eduflow.security.UserDetailsServiceImpl;
import com.eduflow.service.SubmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SubmissionController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class SubmissionControllerTest {

    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @org.springframework.context.annotation.Bean
        public JwtAuthFilter jwtAuthFilter() {
            return new JwtAuthFilter(null, null, null) {
                @Override
                protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
                                                jakarta.servlet.http.HttpServletResponse response,
                                                jakarta.servlet.FilterChain filterChain)
                        throws jakarta.servlet.ServletException, java.io.IOException {
                    filterChain.doFilter(request, response);
                }
            };
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubmissionService submissionService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtBlacklist jwtBlacklist;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "student@eduflow.com", roles = "STUDENT")
    public void testSubmitAsStudentSuccess() throws Exception {
        SubmitRequest request = new SubmitRequest(300L, "Done");
        SubmissionDTO submissionDTO = new SubmissionDTO(400L, 1L, "Student Name", 300L, "Homework 1", "Done", SubmissionStatus.ON_TIME, LocalDateTime.now());

        when(submissionService.submit(any(SubmitRequest.class), eq("student@eduflow.com")))
                .thenReturn(submissionDTO);

        mockMvc.perform(post("/api/submissions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Done"));
    }

    @Test
    public void testSubmitUnauthenticatedUnauthorized() throws Exception {
        SubmitRequest request = new SubmitRequest(300L, "Done");

        mockMvc.perform(post("/api/submissions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetMySubmissionsUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/submissions/my")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
