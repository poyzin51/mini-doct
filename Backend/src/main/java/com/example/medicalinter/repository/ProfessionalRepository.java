package com.example.medicalinter.repository;

import com.example.medicalinter.model.Professional;
import com.example.medicalinter.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessionalRepository extends MongoRepository<Professional, String> {
    
    Optional<Professional> findByUser(User user);
    
    Optional<Professional> findByUserId(String userId);
    
    List<Professional> findBySpecializationContainingIgnoreCase(String specialization);
    
    // Find all professionals ordered by score descending (highest first)
    List<Professional> findAllByOrderByScoreDesc();
    
    // Find professionals by specialization ordered by score descending
    List<Professional> findBySpecializationContainingIgnoreCaseOrderByScoreDesc(String specialization);
    
    // Find professionals with score greater than or equal to a minimum value
    List<Professional> findByScoreGreaterThanEqualOrderByScoreDesc(Double minScore);
    
    // Find top N professionals by score
    @Query(value = "{}", sort = "{ 'score' : -1 }")
    List<Professional> findTopProfessionalsByScore();
    
    Optional<Professional> findByLicenseNumber(String licenseNumber);
    
    boolean existsByLicenseNumber(String licenseNumber);
    
    // Find professionals with available time slots
    @Query("{ 'availableTimeSlots' : { $ne : [] } }")
    List<Professional> findProfessionalsWithAvailableSlots();
} 