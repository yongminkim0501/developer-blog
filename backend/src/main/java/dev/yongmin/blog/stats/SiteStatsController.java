package dev.yongmin.blog.stats;

import dev.yongmin.blog.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stats")
public class SiteStatsController {
    private final SiteStatsService service;
    public SiteStatsController(SiteStatsService service) { this.service = service; }

    @GetMapping
    public ApiResponse<SiteStatsService.Summary> summary() {
        return ApiResponse.ok(service.summary());
    }

    @PostMapping("/visits")
    public ApiResponse<SiteStatsService.Summary> record(@Valid @RequestBody ViewController.ViewRequest request) {
        return ApiResponse.ok(service.record(request.visitorId()));
    }
}
