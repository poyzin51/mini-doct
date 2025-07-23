package com.example.medicalinter.controller;

import com.example.medicalinter.model.Professional;
import com.example.medicalinter.service.ProfessionalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/professionals")
@CrossOrigin(origins = "*")
public class ProfessionalController {

    @Autowired
    private ProfessionalService professionalService;

    // Core feature: Get all professionals ranked by score (highest first)
    @GetMapping("/ranked")
    public ResponseEntity<List<Professional>> getProfessionalsRankedByScore() {
        try {
            List<Professional> professionals = professionalService.getProfessionalsRankedByScore();
            return ResponseEntity.ok(professionals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Core feature: Search professionals by specialization with ranking
    @GetMapping("/search")
    public ResponseEntity<List<Professional>> searchProfessionalsBySpecialization(@RequestParam String specialization) {
        try {
            List<Professional> professionals = professionalService.getProfessionalsBySpecializationRanked(specialization);
            return ResponseEntity.ok(professionals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all professionals
    @GetMapping
    public ResponseEntity<List<Professional>> getAllProfessionals() {
        try {
            List<Professional> professionals = professionalService.getAllProfessionals();
            return ResponseEntity.ok(professionals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get professional by ID
    @GetMapping("/{id}")
    public ResponseEntity<Professional> getProfessionalById(@PathVariable String id) {
        try {
            Optional<Professional> professional = professionalService.findById(id);
            return professional.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get professionals with minimum score
    @GetMapping("/min-score/{minScore}")
    public ResponseEntity<List<Professional>> getProfessionalsWithMinScore(@PathVariable Double minScore) {
        try {
            List<Professional> professionals = professionalService.getProfessionalsWithMinScore(minScore);
            return ResponseEntity.ok(professionals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get professionals with available time slots
    @GetMapping("/available")
    public ResponseEntity<List<Professional>> getProfessionalsWithAvailableSlots() {
        try {
            List<Professional> professionals = professionalService.getProfessionalsWithAvailableSlots();
            return ResponseEntity.ok(professionals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Professional profile management endpoints
    @PutMapping("/profile/{id}")
    public ResponseEntity<Professional> updateProfessional(@PathVariable String id, @RequestBody Professional professional) {
        try {
            professional.setId(id);
            Professional updated = professionalService.updateProfessional(professional);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update professional score (admin functionality)
    @PutMapping("/{id}/score")
    public ResponseEntity<Professional> updateProfessionalScore(@PathVariable String id, @RequestBody ScoreUpdateRequest request) {
        try {
            Professional updated = professionalService.updateScore(id, request.getScore());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Note: Time slot management has been moved to AvailabilityScheduleController
    // Professionals now set availability schedules instead of individual time slots

    // Inner classes for requests
    public static class ScoreUpdateRequest {
        private Double score;

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
    }

    public static class TimeSlotRequest {
        private String timeSlot;

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    }
} 