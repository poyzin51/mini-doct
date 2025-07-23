package com.example.medicalinter.service;

import com.example.medicalinter.model.Professional;
import com.example.medicalinter.model.AvailabilityRange;
import com.example.medicalinter.model.User;
import com.example.medicalinter.repository.ProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

@Service
public class ProfessionalService {
    
    @Autowired
    private ProfessionalRepository professionalRepository;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    
    public Professional registerProfessional(Professional professional) {
        if (professionalRepository.existsByLicenseNumber(professional.getLicenseNumber())) {
            throw new RuntimeException("License number already exists");
        }
        
        professional.setCreatedAt(LocalDateTime.now());
        professional.setUpdatedAt(LocalDateTime.now());
        
        return professionalRepository.save(professional);
    }
    
    public Optional<Professional> findById(String id) {
        return professionalRepository.findById(id);
    }
    
    public Optional<Professional> findByUser(User user) {
        return professionalRepository.findByUser(user);
    }
    
    public Optional<Professional> findByUserId(String userId) {
        return professionalRepository.findByUserId(userId);
    }
    
    public List<Professional> getAllProfessionals() {
        return professionalRepository.findAll();
    }
    
    // Core feature: Get professionals ranked by score (highest first)
    public List<Professional> getProfessionalsRankedByScore() {
        return professionalRepository.findAllByOrderByScoreDesc();
    }
    
    public List<Professional> findBySpecialization(String specialization) {
        return professionalRepository.findBySpecializationContainingIgnoreCase(specialization);
    }
    
    // Core feature: Get professionals by specialization ranked by score
    public List<Professional> getProfessionalsBySpecializationRanked(String specialization) {
        return professionalRepository.findBySpecializationContainingIgnoreCaseOrderByScoreDesc(specialization);
    }
    
    public List<Professional> getProfessionalsWithMinScore(Double minScore) {
        return professionalRepository.findByScoreGreaterThanEqualOrderByScoreDesc(minScore);
    }
    
    public List<Professional> getTopProfessionals() {
        return professionalRepository.findTopProfessionalsByScore();
    }
    
    public List<Professional> getProfessionalsWithAvailableSlots() {
        return professionalRepository.findProfessionalsWithAvailableSlots();
    }
    
    public Professional updateProfessional(Professional professional) {
        professional.setUpdatedAt(LocalDateTime.now());
        return professionalRepository.save(professional);
    }
    
    public Professional updateScore(String professionalId, Double newScore) {
        Optional<Professional> professionalOpt = professionalRepository.findById(professionalId);
        if (professionalOpt.isPresent()) {
            Professional professional = professionalOpt.get();
            
            // Validate score range
            if (newScore < 0.0 || newScore > 100.0) {
                throw new RuntimeException("Score must be between 0 and 100");
            }
            
            professional.setScore(newScore);
            professional.setUpdatedAt(LocalDateTime.now());
            return professionalRepository.save(professional);
        }
        throw new RuntimeException("Professional not found");
    }
    

    
    public void deleteProfessional(String id) {
        professionalRepository.deleteById(id);
    }
    
    public boolean existsByLicenseNumber(String licenseNumber) {
        return professionalRepository.existsByLicenseNumber(licenseNumber);
    }
    
    // Time slot management methods
    public Professional addTimeSlot(String professionalId, String timeSlot) {
        Professional professional = findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        professional.addTimeSlot(timeSlot);
        return professionalRepository.save(professional);
    }
    
    public Professional removeTimeSlot(String professionalId, String timeSlot) {
        Professional professional = findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        professional.removeTimeSlot(timeSlot);
        return professionalRepository.save(professional);
    }
    
    public boolean isTimeSlotAvailable(String professionalId, String timeSlot) {
        Professional professional = findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        return professional.getAvailableTimeSlots().contains(timeSlot);
    }
    
    // Availability range management methods
    public Professional addAvailabilityRange(String professionalId, AvailabilityRange range) {
        Professional professional = findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        professional.addAvailabilityRange(range);
        return professionalRepository.save(professional);
    }
    
    public Professional removeAvailabilityRange(String professionalId, int rangeIndex) {
        Professional professional = findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        professional.removeAvailabilityRange(rangeIndex);
        return professionalRepository.save(professional);
    }
    
    public Professional generateTimeSlotsFromRanges(String professionalId) {
        Professional professional = findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        
        // Clear existing time slots
        professional.getAvailableTimeSlots().clear();
        
        // Generate time slots for the next 4 weeks
        LocalDate today = LocalDate.now();
        LocalDate fourWeeksLater = today.plusWeeks(4);
        
        for (AvailabilityRange range : professional.getAvailabilityRanges()) {
            LocalDate current = today;
            
            // For each day until 4 weeks from now
            while (!current.isAfter(fourWeeksLater)) {
                // If current day matches the day of week in the range
                if (current.getDayOfWeek() == range.getDayOfWeek()) {
                    // Generate slots for this day based on start time, end time and interval
                    LocalTime currentTime = range.getStartTime();
                    LocalTime endTime = range.getEndTime();
                    
                    while (currentTime.isBefore(endTime)) {
                        LocalDateTime slotDateTime = LocalDateTime.of(current, currentTime);
                        
                        // Only add future slots
                        if (slotDateTime.isAfter(LocalDateTime.now())) {
                            professional.addTimeSlot(slotDateTime.format(formatter));
                        }
                        
                        // Move to next slot based on interval
                        currentTime = currentTime.plusMinutes(range.getIntervalMinutes());
                    }
                }
                
                current = current.plusDays(1);
            }
        }
        
        return professionalRepository.save(professional);
    }
} 