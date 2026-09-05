package dev.yongmin.blog.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiResponse<Void>> api(ApiException e) {
        return ResponseEntity.status(e.status()).body(ApiResponse.failure(e.code(), e.getMessage()));
    }
    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class,
        MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class,
        HandlerMethodValidationException.class})
    ResponseEntity<ApiResponse<Void>> invalid(Exception e) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("INVALID_REQUEST", "요청 형식을 확인해주세요."));
    }
    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiResponse<Void>> missing(NoResourceFoundException e) {
        return ResponseEntity.status(404).body(ApiResponse.failure("NOT_FOUND", "API 경로를 찾을 수 없습니다."));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> unexpected(Exception e) {
        log.error("API request failed", e);
        return ResponseEntity.internalServerError().body(ApiResponse.failure("INTERNAL_SERVER_ERROR", "요청 처리 중 오류가 발생했습니다."));
    }
}
