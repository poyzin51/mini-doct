package com.example.medicalinter.model;

public enum UserType {
    PATIENT("patient"),
    PROFESSIONAL("professional");
    
    private final String value;
    
    UserType(String value) {
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