package com.example.medicalinter.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "professionals")
public class Professional {
    
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    @NotBlank(message = "Specialization is required")
    private String specialization;
    
    @NotBlank(message = "License number is required")
    private String licenseNumber;
    
    @DecimalMin(value = "0.0", message = "Score must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Score must be between 0 and 100")
    private Double score;
    
    private String description;
    private String address;
    private Double consultationFee;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<String> availableTimeSlots = new ArrayList<>();
    
    private List<AvailabilityRange> availabilityRanges = new ArrayList<>();
    
    // Constructors
    public Professional() {
        this.score = 0.0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Professional(User user, String specialization, String licenseNumber) {
        this();
        this.user = user;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getSpecialization() {
        return specialization;
    }
    
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
    
    public String getLicenseNumber() {
        return licenseNumber;
    }
    
    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }
    
    public Double getScore() {
        return score;
    }
    
    public void setScore(Double score) {
        this.score = score;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public Double getConsultationFee() {
        return consultationFee;
    }
    
    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
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
    
    public List<String> getAvailableTimeSlots() {
        return availableTimeSlots;
    }
    
    public void setAvailableTimeSlots(List<String> availableTimeSlots) {
        this.availableTimeSlots = availableTimeSlots;
    }
    
    public List<AvailabilityRange> getAvailabilityRanges() {
        return availabilityRanges;
    }
    
    public void setAvailabilityRanges(List<AvailabilityRange> availabilityRanges) {
        this.availabilityRanges = availabilityRanges;
    }
    
    public void addAvailabilityRange(AvailabilityRange range) {
        this.availabilityRanges.add(range);
    }
    
    public void removeAvailabilityRange(int index) {
        if (index >= 0 && index < this.availabilityRanges.size()) {
            this.availabilityRanges.remove(index);
        }
    }
    
    public void addTimeSlot(String timeSlot) {
        if (!this.availableTimeSlots.contains(timeSlot)) {
            this.availableTimeSlots.add(timeSlot);
        }
    }
    
    public void removeTimeSlot(String timeSlot) {
        this.availableTimeSlots.remove(timeSlot);
    }
} 