package com.example.whatsappdemo.repo;

import org.springframework.data.domain.Pageable;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.whatsappdemo.entity.Template;

public interface TemplateRepo extends JpaRepository<Template, Long> {

    public Template findByName(String name);

    @Query("SELECT t.name FROM Template t WHERE t.status = 'APPROVED'")
    Page<String> findAllTemplateNames(Pageable pageable);

}
