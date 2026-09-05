package dev.yongmin.blog.admin;

import dev.yongmin.blog.api.ApiException;
import dev.yongmin.blog.api.ApiResponse;
import dev.yongmin.blog.content.IndexService;
import dev.yongmin.blog.stats.AnalyticsService;
import java.io.IOException;
import java.time.Clock;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminAccess access;
    private final IndexService index;
    private final AnalyticsService analytics;
    private final Clock clock;
    public AdminController(AdminAccess access,IndexService index,AnalyticsService analytics,Clock clock) {
        this.access=access; this.index=index; this.analytics=analytics; this.clock=clock;
    }
    @PostMapping("/reindex")
    public ApiResponse<IndexService.IndexResult> reindex(@RequestHeader(value="X-Admin-Token",required=false) String token) {
        access.require(token);
        try { return ApiResponse.ok(index.sync()); }
        catch(IOException | IllegalArgumentException e) { throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,"INDEX_FAILED","원본 콘텐츠를 확인해주세요. 기존 인덱스는 유지됩니다."); }
    }
    @GetMapping("/analytics")
    public ApiResponse<AnalyticsService.Analytics> analytics(@RequestHeader(value="X-Admin-Token",required=false) String token,
            @RequestParam(required=false) LocalDate from,@RequestParam(required=false) LocalDate to) {
        access.require(token);
        LocalDate end=to==null?LocalDate.now(clock):to;
        return ApiResponse.ok(analytics.summary(from==null?end.minusDays(29):from,end));
    }
}
