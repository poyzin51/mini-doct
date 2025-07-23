package com.example.medicalinter.model;

public enum AppointmentStatus {
    SCHEDULED("scheduled"),
    CONFIRMED("confirmed"),
    CANCELLED("cancelled"),
    COMPLETED("completed"),
    NO_SHOW("no_show");
    
    private final String value;
    
    AppointmentStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    @Override
    public String toString() {
        return value;
    }
} 