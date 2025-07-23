package com.example.medicalinter.controller;

import com.example.medicalinter.model.AvailabilitySchedule;
import com.example.medicalinter.model.Professional;
import com.example.medicalinter.service.AvailabilityScheduleService;
import com.example.medicalinter.service.ProfessionalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "*")
public class AvailabilityScheduleController {

    @Autowired
    private AvailabilityScheduleService scheduleService;

    @Autowired
    private ProfessionalService professionalService;

    // Create a new availability schedule
    @PostMapping("/schedules")
    public ResponseEntity<?> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
        try {
            Optional<Professional> professionalOpt = professionalService.findById(request.getProfessionalId());
            if (professionalOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Professional not found"));
            }

            AvailabilitySchedule schedule = new AvailabilitySchedule(
                professionalOpt.get(),
                request.getDaysOfWeek(),
                request.getStartTime(),
                request.getEndTime(),
                request.getIntervalMinutes()
            );

            if (request.getValidFrom() != null) {
                schedule.setValidFrom(request.getValidFrom());
            }
            if (request.getValidUntil() != null) {
                schedule.setValidUntil(request.getValidUntil());
            }

            AvailabilitySchedule savedSchedule = scheduleService.createSchedule(schedule);
            return ResponseEntity.ok(savedSchedule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get all schedules for a professional
    @GetMapping("/schedules/professional/{professionalId}")
    public ResponseEntity<List<AvailabilitySchedule>> getSchedulesByProfessional(@PathVariable String professionalId) {
        try {
            List<AvailabilitySchedule> schedules = scheduleService.getSchedulesByProfessional(professionalId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get available time slots for a date range
    @GetMapping("/slots/professional/{professionalId}")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(
            @PathVariable String professionalId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            List<LocalDateTime> availableSlots = scheduleService.generateAvailableSlots(professionalId, start, end);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get available slots for a specific date
    @GetMapping("/slots/professional/{professionalId}/date/{date}")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlotsForDate(
            @PathVariable String professionalId,
            @PathVariable String date) {
        try {
            LocalDate targetDate = LocalDate.parse(date);
            List<LocalDateTime> availableSlots = scheduleService.getAvailableSlotsForDate(professionalId, targetDate);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Check if a specific slot is available
    @GetMapping("/slots/professional/{professionalId}/check")
    public ResponseEntity<Boolean> checkSlotAvailability(
            @PathVariable String professionalId,
            @RequestParam String dateTime) {
        try {
            LocalDateTime requestedTime = LocalDateTime.parse(dateTime);
            boolean isAvailable = scheduleService.isSlotAvailable(professionalId, requestedTime);
            return ResponseEntity.ok(isAvailable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get next available slot
    @GetMapping("/slots/professional/{professionalId}/next")
    public ResponseEntity<?> getNextAvailableSlot(@PathVariable String professionalId) {
        try {
            Optional<LocalDateTime> nextSlot = scheduleService.getNextAvailableSlot(professionalId);
            if (nextSlot.isPresent()) {
                return ResponseEntity.ok(nextSlot.get());
            } else {
                return ResponseEntity.ok(new MessageResponse("No available slots found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get availability statistics
    @GetMapping("/stats/professional/{professionalId}")
    public ResponseEntity<AvailabilityScheduleService.AvailabilityStats> getAvailabilityStats(@PathVariable String professionalId) {
        try {
            AvailabilityScheduleService.AvailabilityStats stats = scheduleService.getAvailabilityStats(professionalId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update a schedule
    @PutMapping("/schedules/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable String id, @Valid @RequestBody UpdateScheduleRequest request) {
        try {
            Optional<AvailabilitySchedule> scheduleOpt = scheduleService.findById(id);
            if (scheduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AvailabilitySchedule schedule = scheduleOpt.get();
            schedule.setDaysOfWeek(request.getDaysOfWeek());
            schedule.setStartTime(request.getStartTime());
            schedule.setEndTime(request.getEndTime());
            schedule.setIntervalMinutes(request.getIntervalMinutes());
            schedule.setValidFrom(request.getValidFrom());
            schedule.setValidUntil(request.getValidUntil());
            schedule.setActive(request.isActive());

            AvailabilitySchedule updatedSchedule = scheduleService.updateSchedule(schedule);
            return ResponseEntity.ok(updatedSchedule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Delete a schedule
    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable String id) {
        try {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok(new MessageResponse("Schedule deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Request/Response classes
    public static class CreateScheduleRequest {
        private String professionalId;
        private List<Integer> daysOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer intervalMinutes = 30;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;

        // Getters and setters
        public String getProfessionalId() { return professionalId; }
        public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
        public List<Integer> getDaysOfWeek() { return daysOfWeek; }
        public void setDaysOfWeek(List<Integer> daysOfWeek) { this.daysOfWeek = daysOfWeek; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public Integer getIntervalMinutes() { return intervalMinutes; }
        public void setIntervalMinutes(Integer intervalMinutes) { this.intervalMinutes = intervalMinutes; }
        public LocalDateTime getValidFrom() { return validFrom; }
        public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }
        public LocalDateTime getValidUntil() { return validUntil; }
        public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
    }

    public static class UpdateScheduleRequest {
        private List<Integer> daysOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer intervalMinutes;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;
        private boolean active = true;

        // Getters and setters
        public List<Integer> getDaysOfWeek() { return daysOfWeek; }
        public void setDaysOfWeek(List<Integer> daysOfWeek) { this.daysOfWeek = daysOfWeek; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public Integer getIntervalMinutes() { return intervalMinutes; }
        public void setIntervalMinutes(Integer intervalMinutes) { this.intervalMinutes = intervalMinutes; }
        public LocalDateTime getValidFrom() { return validFrom; }
        public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }
        public LocalDateTime getValidUntil() { return validUntil; }
        public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}