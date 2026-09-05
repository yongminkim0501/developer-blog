package dev.yongmin.blog.admin;

import dev.yongmin.blog.api.ApiException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class AdminAccess {
    private final String token;
    public AdminAccess(@Value("${blog.admin-token:}") String token) { this.token=token; }
    public void require(String supplied) {
        if(token.length()<32 || supplied==null || !MessageDigest.isEqual(token.getBytes(StandardCharsets.UTF_8),supplied.getBytes(StandardCharsets.UTF_8)))
            throw new ApiException(HttpStatus.UNAUTHORIZED,"UNAUTHORIZED","관리자 인증이 필요합니다.");
    }
}
