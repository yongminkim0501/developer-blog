FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew
COPY src src
RUN ./gradlew --no-daemon bootJar -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S blog && adduser -S blog -G blog
COPY --from=build /app/build/libs/blog-api.jar app.jar
USER blog
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
