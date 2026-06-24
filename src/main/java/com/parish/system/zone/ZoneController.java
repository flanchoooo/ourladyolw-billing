package com.parish.system.zone;

import com.parish.system.common.ApiResponse;
import com.parish.system.exception.NotFoundException;
import com.parish.system.zone.dto.ZoneRequest;
import com.parish.system.zone.dto.ZoneResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {
    private final ZoneRepository repository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<ZoneResponse> create(@Valid @RequestBody ZoneRequest request) {
        Zone zone = new Zone();
        apply(zone, request);
        return ApiResponse.ok("Zone created", toResponse(repository.save(zone)));
    }

    @GetMapping
    public ApiResponse<List<ZoneResponse>> all() {
        return ApiResponse.ok("Zones fetched", repository.findAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ZoneResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Zone fetched", toResponse(find(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<ZoneResponse> update(@PathVariable Long id, @Valid @RequestBody ZoneRequest request) {
        Zone zone = find(id);
        apply(zone, request);
        return ApiResponse.ok("Zone updated", toResponse(repository.save(zone)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        repository.delete(find(id));
        return ApiResponse.ok("Zone deleted");
    }

    private Zone find(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Zone not found"));
    }

    private void apply(Zone zone, ZoneRequest request) {
        zone.setName(request.name());
        zone.setLeaderName(request.leaderName());
        zone.setLeaderPhone(request.leaderPhone());
    }

    private ZoneResponse toResponse(Zone zone) {
        return new ZoneResponse(zone.getId(), zone.getName(), zone.getLeaderName(), zone.getLeaderPhone());
    }
}
