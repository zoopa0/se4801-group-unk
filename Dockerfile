# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build the fat JAR (skip tests — tests run in CI)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S eduflow && adduser -S eduflow -G eduflow
USER eduflow

COPY --from=builder /build/target/eduflow-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
