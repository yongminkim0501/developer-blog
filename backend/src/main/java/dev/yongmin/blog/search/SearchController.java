package dev.yongmin.blog.search;

import dev.yongmin.blog.api.ApiResponse;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {
    private final SearchService service;
    public SearchController(SearchService service) { this.service=service; }
    @GetMapping
    public ApiResponse<SearchService.SearchResult> search(@RequestParam @Size(max=200) String q) {
        return ApiResponse.ok(service.search(q));
    }
}
