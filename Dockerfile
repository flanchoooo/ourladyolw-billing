FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre
LABEL org.opencontainers.image.title="parish-system"
WORKDIR /app
COPY --from=build /app/target/parish-system-0.0.1-SNAPSHOT.jar parish-system.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "parish-system.jar"]
