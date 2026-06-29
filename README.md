# EduFlow Enterprise

EduFlow Enterprise is an enterprise-grade student productivity and course management system built using a React + TypeScript frontend and a Spring Boot + JPA + PostgreSQL backend.

---

## Quick Start (for reviewers)

Requirements: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
git clone <your-repo-url>
cd se4801-group-unk-main
docker compose up --build
```

Then open:

- **Frontend (UI):** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Health check:** http://localhost:8080/actuator/health

No `.env` file is required — Docker Compose uses safe defaults. To override database or JWT settings, copy `.env.example` to `.env` before starting.

To stop everything: `docker compose down`

---

## 🔒 OWASP Risk Mitigation Strategy

EduFlow's API is designed in strict compliance with standard API security guidelines to mitigate common OWASP vulnerability risks:

### API1: Broken Object Level Auth (BOLA)
* **Strategy**: Every data-access method in the service layer compares the authenticated user's ID (retrieved securely from Spring Security's `SecurityContext`) to the owner ID of the requested resource.
* **Examples**:
  * A student calling `GET /api/submissions/my` receives only their own rows — the database query explicitly includes `WHERE student_id = :authenticatedUserId`.
  * An instructor calling `GET /api/submissions/assignment/{id}` first verifies that the target assignment belongs to a course they own before returning any student submission data.

### API2: Broken Authentication
* **Strategy**: Stateless JWT authentication signed with the `HS256` algorithm and a strong 256-bit signing key loaded strictly from the `JWT_SECRET` environment variable (never hardcoded).
* **Details**:
  * Token expiration is set to 24 hours.
  * Logout is handled via a secure, server-side JTI (JSON Web Token ID) blacklist.
  * Passwords are encrypted using a standard `BCryptPasswordEncoder` with a strength factor of `12`.
  * Spring Security blocks all unauthenticated access to protected endpoints.

### API3: Broken Object Property Level Auth
* **Strategy**: Controllers never return Hibernate/JPA `@Entity` objects directly. All API responses are mapped to highly specific Data Transfer Objects (DTOs represented as Java records) containing only the property fields appropriate for the caller's role.
* **Example**: The `UserDTO` returned to a `STUDENT` completely omits properties like `passwordHash` and excludes other students' private data.

### API4: Unrestricted Resource Consumption
* **Strategy**: 
  * All collection list endpoints are strictly paginated using Spring Data's `Pageable` with a default page size of `20` and a maximum limit of `100`.
  * Jakarta Bean Validation enforces size and length constraints on all input strings using `@Size(max=...)`.
  * Student submission character content is capped at a maximum of `5000` characters.

### API7: Server-Side Request Forgery (SSRF)
* **Strategy**: The application is entirely self-contained and does not make outbound HTTP requests to user-supplied URLs. No URL parameters are parsed or followed server-side.

### API8: Security Misconfiguration
* **Strategy**:
  * Cross-Origin Resource Sharing (CORS) is configured explicitly in `SecurityConfig` without wildcard (`*`) origins permitted in production profiles.
  * `spring.jpa.hibernate.ddl-auto` is set to `validate` in the production profile to prevent accidental schema drops.
  * All secrets and database credentials are loaded strictly through environment variables.
  * Swagger UI and OpenAPI docs are disabled in the production Spring profile.

---

## 🧪 Test Suite Matrix

Our testing strategy follows a tiered verification model spanning repositories, service layers, controllers, and end-to-end security integration:

| Layer | Test Class | What It Tests | Tools & Technologies |
| :--- | :--- | :--- | :--- |
| **Repository** | `CourseRepositoryTest` | `findByCourseCode`; `findByInstructorId`; `findAllByPublishedTrue` | JUnit 5, Spring Boot Test (`@DataJpaTest`), H2 (In-Memory DB) |
| **Repository** | `EnrollmentRepositoryTest` | Uniqueness checking queries (`findByStudentIdAndCourseId`, `existsByStudentIdAndCourseId`) | JUnit 5, Spring Boot Test (`@DataJpaTest`), H2 |
| **Repository** | `SubmissionRepositoryTest` | Querying `findByAssignmentIdAndStatus` and `findByStudentId` | JUnit 5, Spring Boot Test (`@DataJpaTest`), H2 |
| **Service** | `AuthServiceTest` | `register()`: happy path, duplicate email → exception; `login()`: happy path, wrong password → exception | JUnit 5, Mockito |
| **Service** | `CourseServiceTest` | `create()`: happy path; `update()`: happy path, unauthorized BOLA block → 403; `delete()`: as admin happy path, non-admin → 403 | JUnit 5, Mockito |
| **Service** | `EnrollmentServiceTest` | `enroll()`: happy path; duplicate enrollment → 409; enroll in unpublished course → 403 | JUnit 5, Mockito |
| **Service** | `AssignmentServiceTest` | `createAssignment()`: happy path; update when submissions exist → 409; create for course not owned → 403 | JUnit 5, Mockito |
| **Service** | `SubmissionServiceTest` | `submit()`: on-time → `ON_TIME` status; submit after `dueDate` → rejected; submit twice → 409; BOLA access control → 403 | JUnit 5, Mockito |
| **Controller** | `AuthControllerTest` | `POST /api/auth/register` (201/409 Conflict); `POST /api/auth/login` (200/401 Unauthorized) | `@WebMvcTest`, MockMvc |
| **Controller** | `CourseControllerTest` | `GET /api/courses` (200 paginated); `POST /api/courses` as STUDENT → 403, as INSTRUCTOR → 201 | `@WebMvcTest`, MockMvc, `@WithMockUser` |
| **Controller** | `SubmissionControllerTest` | `POST /api/submissions` as STUDENT → 201, unauthenticated → 401; `GET /api/submissions/my` as INSTRUCTOR → 403 | `@WebMvcTest`, MockMvc, `@WithMockUser` |
| **Security** | `SecurityIntegrationTest` | **BOLA Enforcement**: Student A cannot fetch Student B's submissions (403); expired/blacklisted JWTs rejected (401); role routing guards block requests with incorrect privileges (403) | `@SpringBootTest`, MockMvc, `@WithMockUser`, **Testcontainers (PostgreSQL)** |

---

## 🛠️ Admin Role Specifications & Constraints

The `ADMIN` role is the primary administrative account within EduFlow. It has specific powers and constraints:

### Capabilities:
1. **User Management**: Creates, updates, and deactivates system user accounts.
2. **Privilege Assignment**: Assigns user roles (`STUDENT`, `INSTRUCTOR`, `ADMIN`).
3. **Account Maintenance**: Resets passwords and manually locks/unlocks suspicious accounts.
4. **Oversight**: Views all registered courses, assignments, and student submissions across the system.
5. **System Configuration**: Sets system-wide application settings.

### Functional Constraints:
* **No Academic Actions**: The admin is strictly an administrative actor. Admins cannot enroll in courses, submit assignments, or act as an active student or course instructor.

---

## 🐳 Deployment Architecture

EduFlow is deployed locally and in production using Docker Compose. The environment consists of three services isolated on a private bridge network:

```
[ Browser ]
     │
     ▼  (Port 3000)
┌────────────────────────────────┐
│   React Frontend (nginx)       │  (Service: 'frontend')
│   Proxies /api → backend       │
└────────┬───────────────────────┘
         │
         ▼  (Port 8080, internal network)
┌────────────────────────────────┐
│   Spring Boot App Container    │  (Service: 'app')
└────────┬───────────────────────┘
         │
         ▼  (Port 5432, internal network only)
┌────────────────────────────────┐
│      PostgreSQL Database       │  (Service: 'db')
└────────────────────────────────┘
```

### Docker Compose Service Configuration

| Service Name | Container Image | Port Mapping | Key Environment Variables |
| :--- | :--- | :--- | :--- |
| **frontend** | Built from `./frontend/Dockerfile` | `3000:80` (host:container) | Uses nginx to serve the React app and proxy API calls |
| **app** | Built from `./Dockerfile` | `8080:8080` (host:container) | `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USER`, `DB_PASS`, `JWT_SECRET` |
| **db** | `postgres:15` | internal only | `POSTGRES_DB=eduflow`, `POSTGRES_USER`, `POSTGRES_PASSWORD` |

### Key Startup & Orchestration Details
* **Startup Ordering**: The `app` service utilizes `depends_on` with `condition: service_healthy` referencing the database. The `db` service runs a health check using `pg_isready`, preventing start-up race conditions.
* **Secret Isolation**: All credentials and sensitive keys (`JWT_SECRET`, `DB_PASS`, `POSTGRES_PASSWORD`) are loaded dynamically from a local `.env` file that is git-ignored and kept out of version control.
* **Automatic Migrations**: Flyway runs migrations (`V1__create_users.sql` through `V5__create_indexes.sql`) automatically on application startup to ensure schema alignment before requests are accepted.
* **Container Health**: Exposes the Spring Boot Actuator endpoint (`/actuator/health`) to facilitate orchestration health checks.
