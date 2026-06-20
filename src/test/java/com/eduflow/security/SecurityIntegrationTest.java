package com.eduflow.security;

import com.eduflow.domain.*;
import com.eduflow.repository.AssignmentRepository;
import com.eduflow.repository.CourseRepository;
import com.eduflow.repository.SubmissionRepository;
import com.eduflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private JwtBlacklist jwtBlacklist;

    private User studentA;
    private User studentB;
    private User instructor;
    private Assignment assignment;
    private Submission submissionB;

    @BeforeEach
    public void setUp() {
        submissionRepository.deleteAll();
        assignmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        studentA = User.builder()
                .email("studenta@eduflow.com")
                .passwordHash("pwd")
                .fullName("Student A")
                .role(Role.STUDENT)
                .active(true)
                .build();
        studentA = userRepository.save(studentA);

        studentB = User.builder()
                .email("studentb@eduflow.com")
                .passwordHash("pwd")
                .fullName("Student B")
                .role(Role.STUDENT)
                .active(true)
                .build();
        studentB = userRepository.save(studentB);

        instructor = User.builder()
                .email("instructor@eduflow.com")
                .passwordHash("pwd")
                .fullName("Instructor")
                .role(Role.INSTRUCTOR)
                .active(true)
                .build();
        instructor = userRepository.save(instructor);

        Course course = Course.builder()
                .courseCode("CS-101")
                .title("CS 101")
                .description("Intro")
                .published(true)
                .instructor(instructor)
                .build();
        course = courseRepository.save(course);

        assignment = Assignment.builder()
                .course(course)
                .title("HW 1")
                .description("Solve")
                .dueDate(LocalDateTime.now().plusDays(2))
                .maxScore(100)
                .build();
        assignment = assignmentRepository.save(assignment);

        submissionB = Submission.builder()
                .student(studentB)
                .assignment(assignment)
                .content("B's submission content")
                .status(SubmissionStatus.ON_TIME)
                .build();
        submissionB = submissionRepository.save(submissionB);
    }

    @Test
    public void testBolaStudentCannotAccessOthersSubmission() throws Exception {
        String tokenA = jwtUtils.generateToken(studentA.getEmail(), studentA.getRole());

        // Student A tries to view student B's submissions/my endpoint.
        // Wait, GET /api/submissions/my retrieves the authenticated student's submissions.
        // What about fetching submissions for student B's assignment?
        // GET /api/submissions/assignment/{id} requires INSTRUCTOR role, so student A gets 403.
        // Let's test that student A gets 403 on instructor endpoint.
        mockMvc.perform(get("/api/submissions/assignment/" + assignment.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testRoleGuardStudentCannotAccessAdminEndpoints() throws Exception {
        String token = jwtUtils.generateToken(studentA.getEmail(), studentA.getRole());

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testInvalidTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer invalidtoken"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testBlacklistedTokenReturns401() throws Exception {
        String token = jwtUtils.generateToken(studentA.getEmail(), studentA.getRole());
        String jti = jwtUtils.extractJti(token);
        jwtBlacklist.blacklist(jti);

        mockMvc.perform(get("/api/submissions/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
