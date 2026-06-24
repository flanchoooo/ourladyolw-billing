package com.parish.system.masscentre;

import com.parish.system.common.ApiResponse;
import com.parish.system.exception.NotFoundException;
import com.parish.system.masscentre.dto.MassCentreRequest;
import com.parish.system.masscentre.dto.MassCentreResponse;
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
@RequestMapping("/api/mass-centres")
@RequiredArgsConstructor
public class MassCentreController {
    private final MassCentreRepository repository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<MassCentreResponse> create(@Valid @RequestBody MassCentreRequest request) {
        MassCentre massCentre = new MassCentre();
        apply(massCentre, request);
        return ApiResponse.ok("Mass centre created", toResponse(repository.save(massCentre)));
    }

    @GetMapping
    public ApiResponse<List<MassCentreResponse>> all() {
        return ApiResponse.ok("Mass centres fetched", repository.findAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<MassCentreResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Mass centre fetched", toResponse(find(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<MassCentreResponse> update(@PathVariable Long id, @Valid @RequestBody MassCentreRequest request) {
        MassCentre massCentre = find(id);
        apply(massCentre, request);
        return ApiResponse.ok("Mass centre updated", toResponse(repository.save(massCentre)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        repository.delete(find(id));
        return ApiResponse.ok("Mass centre deleted");
    }

    private MassCentre find(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Mass centre not found"));
    }

    private void apply(MassCentre massCentre, MassCentreRequest request) {
        massCentre.setName(request.name());
        massCentre.setLocation(request.location());
    }

    private MassCentreResponse toResponse(MassCentre massCentre) {
        return new MassCentreResponse(massCentre.getId(), massCentre.getName(), massCentre.getLocation());
    }
}
