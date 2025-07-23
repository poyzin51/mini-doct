package com.example.medicalinter.service;

import com.example.medicalinter.model.Appointment;
import com.example.medicalinter.model.AppointmentStatus;
import com.example.medicalinter.model.Professional;
import com.example.medicalinter.model.User;
import com.example.medicalinter.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private ProfessionalService professionalService;
    
    @Autowired
    private AvailabilityScheduleService availabilityScheduleService;
    
    public Appointment bookAppointment(User patient, Professional professional, 
                                     LocalDateTime appointmentDateTime, String timeSlot, String reason) {
        
        // Check if time slot is available using the new availability system
        if (!availabilityScheduleService.isSlotAvailable(professional.getId(), appointmentDateTime)) {
            throw new RuntimeException("Time slot is not available");
        }
        
        // Check if the time slot is already booked
        Optional<Appointment> existingAppointment = appointmentRepository
                .findByProfessionalAndTimeSlotAndStatus(professional, timeSlot, AppointmentStatus.SCHEDULED);
        
        if (existingAppointment.isPresent()) {
            throw new RuntimeException("Time slot is already booked");
        }
        
        // Create new appointment
        Appointment appointment = new Appointment(patient, professional, appointmentDateTime, timeSlot);
        appointment.setReason(reason);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        return appointmentRepository.save(appointment);
    }
    
    public Optional<Appointment> findById(String id) {
        return appointmentRepository.findById(id);
    }
    
    public List<Appointment> getPatientAppointments(User patient) {
        return appointmentRepository.findByPatient(patient);
    }
    
    public List<Appointment> getPatientAppointments(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    public List<Appointment> getProfessionalAppointments(Professional professional) {
        return appointmentRepository.findByProfessional(professional);
    }
    
    public List<Appointment> getProfessionalAppointments(String professionalId) {
        return appointmentRepository.findByProfessionalId(professionalId);
    }
    
    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }
    
    public List<Appointment> getPatientAppointmentsByStatus(User patient, AppointmentStatus status) {
        return appointmentRepository.findByPatientAndStatusOrderByAppointmentDateTimeAsc(patient, status);
    }
    
    public List<Appointment> getProfessionalAppointmentsByStatus(Professional professional, AppointmentStatus status) {
        return appointmentRepository.findByProfessionalAndStatusOrderByAppointmentDateTimeAsc(professional, status);
    }
    
    public List<Appointment> getUpcomingPatientAppointments(String patientId) {
        return appointmentRepository.findUpcomingAppointmentsByPatient(patientId, LocalDateTime.now());
    }
    
    public List<Appointment> getUpcomingProfessionalAppointments(String professionalId) {
        return appointmentRepository.findUpcomingAppointmentsByProfessional(professionalId, LocalDateTime.now());
    }
    
    public List<Appointment> getAppointmentsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByAppointmentDateTimeBetween(startDate, endDate);
    }
    
    public List<Appointment> getPatientAppointmentsBetweenDates(User patient, LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByPatientAndAppointmentDateTimeBetween(patient, startDate, endDate);
    }
    
    public List<Appointment> getProfessionalAppointmentsBetweenDates(Professional professional, LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByProfessionalAndAppointmentDateTimeBetween(professional, startDate, endDate);
    }
    
    public Appointment updateAppointment(String appointmentId, LocalDateTime newDateTime, String newTimeSlot, String reason) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            
            // Check if appointment can be modified
            if (!appointment.canBeCancelled()) {
                throw new RuntimeException("Appointment cannot be modified in its current state");
            }
            
            // If time slot is changing, check availability
            if (!appointment.getTimeSlot().equals(newTimeSlot)) {
                if (!professionalService.isTimeSlotAvailable(appointment.getProfessional().getId(), newTimeSlot)) {
                    throw new RuntimeException("New time slot is not available");
                }
                
                // Return old time slot to available slots
                professionalService.addTimeSlot(appointment.getProfessional().getId(), appointment.getTimeSlot());
                
                // Remove new time slot from available slots
                professionalService.removeTimeSlot(appointment.getProfessional().getId(), newTimeSlot);
                
                appointment.setTimeSlot(newTimeSlot);
            }
            
            appointment.setAppointmentDateTime(newDateTime);
            appointment.setReason(reason);
            appointment.setUpdatedAt(LocalDateTime.now());
            
            return appointmentRepository.save(appointment);
        }
        throw new RuntimeException("Appointment not found");
    }
    
    public Appointment cancelAppointment(String appointmentId, String userId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            
            // Check if user can cancel this appointment
            if (!appointment.canBeModifiedBy(userId)) {
                throw new RuntimeException("You are not authorized to cancel this appointment");
            }
            
            if (!appointment.canBeCancelled()) {
                throw new RuntimeException("Appointment cannot be cancelled in its current state");
            }
            
            // Return the time slot to professional's available slots
            professionalService.addTimeSlot(appointment.getProfessional().getId(), appointment.getTimeSlot());
            
            appointment.cancel();
            return appointmentRepository.save(appointment);
        }
        throw new RuntimeException("Appointment not found");
    }
    
    public Appointment confirmAppointment(String appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.confirm();
            return appointmentRepository.save(appointment);
        }
        throw new RuntimeException("Appointment not found");
    }
    
    public Appointment completeAppointment(String appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.complete();
            return appointmentRepository.save(appointment);
        }
        throw new RuntimeException("Appointment not found");
    }
    
    public void deleteAppointment(String id) {
        appointmentRepository.deleteById(id);
    }
    
    public long countAppointmentsByProfessionalAndStatus(Professional professional, AppointmentStatus status) {
        return appointmentRepository.countByProfessionalAndStatus(professional, status);
    }
    
    public long countAppointmentsByPatientAndStatus(User patient, AppointmentStatus status) {
        return appointmentRepository.countByPatientAndStatus(patient, status);
    }
} 