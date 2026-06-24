package com.parish.system.ministry;

import com.parish.system.common.ApiResponse;
import com.parish.system.exception.NotFoundException;
import com.parish.system.ministry.dto.MinistryRequest;
import com.parish.system.ministry.dto.MinistryResponse;
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
@RequestMapping("/api/ministries")
@RequiredArgsConstructor
public class MinistryController {
    private final MinistryRepository repository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<MinistryResponse> create(@Valid @RequestBody MinistryRequest request) {
        Ministry ministry = new Ministry();
        ministry.setName(request.name());
        ministry.setDescription(request.description());
        return ApiResponse.ok("Ministry created", toResponse(repository.save(ministry)));
    }

    @GetMapping
    public ApiResponse<List<MinistryResponse>> all() {
        return ApiResponse.ok("Ministries fetched", repository.findAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<MinistryResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Ministry fetched", toResponse(find(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<MinistryResponse> update(@PathVariable Long id, @Valid @RequestBody MinistryRequest request) {
        Ministry ministry = find(id);
        ministry.setName(request.name());
        ministry.setDescription(request.description());
        return ApiResponse.ok("Ministry updated", toResponse(repository.save(ministry)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        repository.delete(find(id));
        return ApiResponse.ok("Ministry deleted");
    }

    private Ministry find(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Ministry not found"));
    }

    private MinistryResponse toResponse(Ministry ministry) {
        return new MinistryResponse(ministry.getId(), ministry.getName(), ministry.getDescription());
    }
}
