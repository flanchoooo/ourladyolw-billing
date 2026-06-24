package com.parish.system.guild;

import com.parish.system.common.ApiResponse;
import com.parish.system.exception.NotFoundException;
import com.parish.system.guild.dto.GuildRequest;
import com.parish.system.guild.dto.GuildResponse;
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
@RequestMapping("/api/guilds")
@RequiredArgsConstructor
public class GuildController {
    private final GuildRepository repository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<GuildResponse> create(@Valid @RequestBody GuildRequest request) {
        Guild guild = new Guild();
        guild.setName(request.name());
        guild.setDescription(request.description());
        return ApiResponse.ok("Guild created", toResponse(repository.save(guild)));
    }

    @GetMapping
    public ApiResponse<List<GuildResponse>> all() {
        return ApiResponse.ok("Guilds fetched", repository.findAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<GuildResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok("Guild fetched", toResponse(find(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<GuildResponse> update(@PathVariable Long id, @Valid @RequestBody GuildRequest request) {
        Guild guild = find(id);
        guild.setName(request.name());
        guild.setDescription(request.description());
        return ApiResponse.ok("Guild updated", toResponse(repository.save(guild)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PARISH_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        repository.delete(find(id));
        return ApiResponse.ok("Guild deleted");
    }

    private Guild find(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Guild not found"));
    }

    private GuildResponse toResponse(Guild guild) {
        return new GuildResponse(guild.getId(), guild.getName(), guild.getDescription());
    }
}
