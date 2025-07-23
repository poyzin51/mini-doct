package com.example.medicalinter.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "availability_schedules")
public class AvailabilitySchedule {
    
    @Id
    private String id;
    
    @DBRef
    @NotNull(message = "Professional is required")
    private Professional professional;
    
    @NotNull(message = "Days of week are required")
    private List<Integer> daysOfWeek; // 1=Monday, 2=Tuesday, ..., 7=Sunday
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @Min(value = 15, message = "Interval must be at least 15 minutes")
    @Max(value = 120, message = "Interval must be at most 120 minutes")
    private Integer intervalMinutes = 30;
    
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    
    private boolean isActive = true;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public AvailabilitySchedule() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public AvailabilitySchedule(Professional professional, List<Integer> daysOfWeek, 
                               LocalTime startTime, LocalTime endTime, Integer intervalMinutes) {
        this();
        this.professional = professional;
        this.daysOfWeek = daysOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.intervalMinutes = intervalMinutes;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Professional getProfessional() {
        return professional;
    }
    
    public void setProfessional(Professional professional) {
        this.professional = professional;
    }
    
    public List<Integer> getDaysOfWeek() {
        return daysOfWeek;
    }
    
    public void setDaysOfWeek(List<Integer> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }
    
    public LocalTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    
    public Integer getIntervalMinutes() {
        return intervalMinutes;
    }
    
    public void setIntervalMinutes(Integer intervalMinutes) {
        this.intervalMinutes = intervalMinutes;
    }
    
    public LocalDateTime getValidFrom() {
        return validFrom;
    }
    
    public void setValidFrom(LocalDateTime validFrom) {
        this.validFrom = validFrom;
    }
    
    public LocalDateTime getValidUntil() {
        return validUntil;
    }
    
    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper methods
    public boolean isValidForDate(LocalDateTime dateTime) {
        int dayOfWeek = dateTime.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
        
        if (!daysOfWeek.contains(dayOfWeek)) {
            return false;
        }
        
        if (validFrom != null && dateTime.isBefore(validFrom)) {
            return false;
        }
        
        if (validUntil != null && dateTime.isAfter(validUntil)) {
            return false;
        }
        
        return isActive;
    }
    
    public boolean isTimeWithinRange(LocalTime time) {
        return !time.isBefore(startTime) && !time.isAfter(endTime);
    }
}