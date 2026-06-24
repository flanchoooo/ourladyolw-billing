package com.parish.system.section;

import com.parish.system.common.ApiResponse;
import com.parish.system.exception.NotFoundException;
import com.parish.system.section.dto.SectionRequest;
import com.parish.system.section.dto.SectionResponse;
import com.parish.system.zone.ZoneRepository;
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
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {
    private final SectionRepository repository;
    private final ZoneRepository zoneRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<SectionResponse> create(@Valid @RequestBody SectionRequest request) {
        Section section = new Section();
        apply(section, request);
        return ApiResponse.ok("Section created", toResponse(repository.save(section)));
    }

    @GetMapping
    public ApiResponse<List<SectionResponse>> all() {
        return ApiResponse.ok("Sections fetched", repository.findAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<SectionResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Section fetched", toResponse(find(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<SectionResponse> update(@PathVariable Long id, @Valid @RequestBody SectionRequest request) {
        Section section = find(id);
        apply(section, request);
        return ApiResponse.ok("Section updated", toResponse(repository.save(section)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        repository.delete(find(id));
        return ApiResponse.ok("Section deleted");
    }

    private Section find(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Section not found"));
    }

    private void apply(Section section, SectionRequest request) {
        section.setName(request.name());
        section.setZone(zoneRepository.findById(request.zoneId()).orElseThrow(() -> new NotFoundException("Zone not found")));
    }

    private SectionResponse toResponse(Section section) {
        return new SectionResponse(section.getId(), section.getName(), section.getZone().getId(), section.getZone().getName());
    }
}
