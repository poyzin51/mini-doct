package com.example.medicalinter.repository;

import com.example.medicalinter.model.AvailabilitySchedule;
import com.example.medicalinter.model.Professional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AvailabilityScheduleRepository extends MongoRepository<AvailabilitySchedule, String> {
    
    List<AvailabilitySchedule> findByProfessional(Professional professional);
    
    List<AvailabilitySchedule> findByProfessionalId(String professionalId);
    
    List<AvailabilitySchedule> findByProfessionalAndIsActive(Professional professional, boolean isActive);
    
    List<AvailabilitySchedule> findByProfessionalIdAndIsActive(String professionalId, boolean isActive);
    
    // Find schedules that are valid for a specific date range
    @Query("{ 'professional.$id' : ?0, 'isActive' : true, " +
           "$or: [ " +
           "  { 'validFrom' : null, 'validUntil' : null }, " +
           "  { 'validFrom' : null, 'validUntil' : { $gte : ?1 } }, " +
           "  { 'validFrom' : { $lte : ?2 }, 'validUntil' : null }, " +
           "  { 'validFrom' : { $lte : ?2 }, 'validUntil' : { $gte : ?1 } } " +
           "] }")
    List<AvailabilitySchedule> findActiveSchedulesForDateRange(String professionalId, 
                                                              LocalDateTime startDate, 
                                                              LocalDateTime endDate);
    
    // Find schedules for a specific day of week
    @Query("{ 'professional.$id' : ?0, 'isActive' : true, 'daysOfWeek' : ?1 }")
    List<AvailabilitySchedule> findByProfessionalIdAndDayOfWeek(String professionalId, Integer dayOfWeek);
    
    // Count active schedules for a professional
    long countByProfessionalAndIsActive(Professional professional, boolean isActive);
}