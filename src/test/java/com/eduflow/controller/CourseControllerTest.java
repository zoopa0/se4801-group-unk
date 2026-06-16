package com.eduflow.controller;

import com.eduflow.dto.CourseDTO;
import com.eduflow.dto.CreateCourseRequest;
import com.eduflow.security.JwtAuthFilter;
import com.eduflow.security.JwtBlacklist;
import com.eduflow.security.JwtUtils;
import com.eduflow.security.SecurityConfig;
import com.eduflow.security.UserDetailsServiceImpl;
import com.eduflow.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class CourseControllerTest {

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
    private CourseService courseService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtBlacklist jwtBlacklist;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testListPublishedCourses() throws Exception {
        CourseDTO course = new CourseDTO(100L, 2L, "Instructor Name", "Intro CS", "Intro", "CS-101", true, LocalDateTime.now());
        Page<CourseDTO> page = new PageImpl<>(List.of(course));

        when(courseService.listPublished(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].courseCode").value("CS-101"));
    }

    @Test
    public void testCreateCourseUnauthenticatedReturns401() throws Exception {
        CreateCourseRequest request = new CreateCourseRequest("CS-101", "Intro CS", "Intro", true);

        mockMvc.perform(post("/api/courses")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "instructor@eduflow.com", roles = "INSTRUCTOR")
    public void testCreateCourseAsInstructorSuccess() throws Exception {
        CreateCourseRequest request = new CreateCourseRequest("CS-101", "Intro CS", "Intro", true);
        CourseDTO course = new CourseDTO(100L, 2L, "Instructor", "Intro CS", "Intro", "CS-101", true, LocalDateTime.now());

        when(courseService.create(any(CreateCourseRequest.class), eq("instructor@eduflow.com")))
                .thenReturn(course);

        mockMvc.perform(post("/api/courses")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseCode").value("CS-101"));
    }
}
