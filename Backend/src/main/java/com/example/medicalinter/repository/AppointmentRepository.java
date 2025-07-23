package com.example.medicalinter.repository;

import com.example.medicalinter.model.Appointment;
import com.example.medicalinter.model.AppointmentStatus;
import com.example.medicalinter.model.Professional;
import com.example.medicalinter.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    
    List<Appointment> findByPatient(User patient);
    
    List<Appointment> findByPatientId(String patientId);
    
    List<Appointment> findByProfessional(Professional professional);
    
    List<Appointment> findByProfessionalId(String professionalId);
    
    List<Appointment> findByStatus(AppointmentStatus status);
    
    List<Appointment> findByPatientAndStatus(User patient, AppointmentStatus status);
    
    List<Appointment> findByProfessionalAndStatus(Professional professional, AppointmentStatus status);
    
    // Find appointments between two dates
    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find patient's appointments between dates
    List<Appointment> findByPatientAndAppointmentDateTimeBetween(
            User patient, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find professional's appointments between dates
    List<Appointment> findByProfessionalAndAppointmentDateTimeBetween(
            Professional professional, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find appointments by patient and status ordered by date
    List<Appointment> findByPatientAndStatusOrderByAppointmentDateTimeAsc(
            User patient, AppointmentStatus status);
    
    // Find appointments by professional and status ordered by date
    List<Appointment> findByProfessionalAndStatusOrderByAppointmentDateTimeAsc(
            Professional professional, AppointmentStatus status);
    
    // Check if a time slot is already booked for a professional
    Optional<Appointment> findByProfessionalAndTimeSlotAndStatus(
            Professional professional, String timeSlot, AppointmentStatus status);
    
    // Find upcoming appointments for a patient
    @Query("{ 'patient.$id' : ?0, 'appointmentDateTime' : { $gte : ?1 }, 'status' : { $in : ['scheduled', 'confirmed'] } }")
    List<Appointment> findUpcomingAppointmentsByPatient(String patientId, LocalDateTime currentDateTime);
    
    // Find upcoming appointments for a professional
    @Query("{ 'professional.$id' : ?0, 'appointmentDateTime' : { $gte : ?1 }, 'status' : { $in : ['scheduled', 'confirmed'] } }")
    List<Appointment> findUpcomingAppointmentsByProfessional(String professionalId, LocalDateTime currentDateTime);
    
    // Count appointments by professional and status
    long countByProfessionalAndStatus(Professional professional, AppointmentStatus status);
    
    // Count appointments by patient and status
    long countByPatientAndStatus(User patient, AppointmentStatus status);
} 