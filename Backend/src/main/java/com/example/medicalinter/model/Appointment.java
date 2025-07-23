package com.example.medicalinter.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "appointments")
public class Appointment {
    
    @Id
    private String id;
    
    @DBRef
    @NotNull(message = "Patient is required")
    private User patient;
    
    @DBRef
    @NotNull(message = "Professional is required")
    private Professional professional;
    
    @NotNull(message = "Appointment date and time is required")
    private LocalDateTime appointmentDateTime;
    
    @NotNull(message = "Appointment status is required")
    private AppointmentStatus status;
    
    @NotBlank(message = "Time slot is required")
    private String timeSlot;
    
    private String reason;
    private String notes;
    private Double consultationFee;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public Appointment() {
        this.status = AppointmentStatus.SCHEDULED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Appointment(User patient, Professional professional, LocalDateTime appointmentDateTime, String timeSlot) {
        this();
        this.patient = patient;
        this.professional = professional;
        this.appointmentDateTime = appointmentDateTime;
        this.timeSlot = timeSlot;
        this.consultationFee = professional.getConsultationFee();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public User getPatient() {
        return patient;
    }
    
    public void setPatient(User patient) {
        this.patient = patient;
    }
    
    public Professional getProfessional() {
        return professional;
    }
    
    public void setProfessional(Professional professional) {
        this.professional = professional;
    }
    
    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }
    
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }
    
    public AppointmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(AppointmentStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getTimeSlot() {
        return timeSlot;
    }
    
    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    // Helper methods
    public boolean canBeModifiedBy(String userId) {
        return this.patient.getId().equals(userId) && 
               (this.status == AppointmentStatus.SCHEDULED || this.status == AppointmentStatus.CONFIRMED);
    }
    
    public boolean canBeCancelled() {
        return this.status == AppointmentStatus.SCHEDULED || this.status == AppointmentStatus.CONFIRMED;
    }
    
    public void cancel() {
        if (canBeCancelled()) {
            this.status = AppointmentStatus.CANCELLED;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void confirm() {
        if (this.status == AppointmentStatus.SCHEDULED) {
            this.status = AppointmentStatus.CONFIRMED;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void complete() {
        if (this.status == AppointmentStatus.CONFIRMED) {
            this.status = AppointmentStatus.COMPLETED;
            this.updatedAt = LocalDateTime.now();
        }
    }
} 