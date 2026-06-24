package com.parish.system.section;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, Long> {
    @Override
    @EntityGraph(attributePaths = "zone")
    List<Section> findAll();

    @Override
    @EntityGraph(attributePaths = "zone")
    Optional<Section> findById(Long id);
}
