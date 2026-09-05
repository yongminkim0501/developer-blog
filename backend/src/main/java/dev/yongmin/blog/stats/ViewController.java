package dev.yongmin.blog.stats;

import dev.yongmin.blog.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts/{slug}/views")
public class ViewController {
    private final ViewService service;
    public ViewController(ViewService service) { this.service=service; }
    @GetMapping public ApiResponse<ViewService.ViewCount> get(@PathVariable String slug) { return ApiResponse.ok(service.get(slug)); }
    @PostMapping public ApiResponse<ViewService.ViewCount> record(@PathVariable String slug,@Valid @RequestBody ViewRequest request) {
        return ApiResponse.ok(service.record(slug,request.visitorId()));
    }
    public record ViewRequest(@NotNull UUID visitorId) {}
}
