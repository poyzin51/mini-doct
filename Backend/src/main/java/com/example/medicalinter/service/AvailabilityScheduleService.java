package com.example.medicalinter.service;

import com.example.medicalinter.model.AvailabilitySchedule;
import com.example.medicalinter.model.Professional;
import com.example.medicalinter.model.Appointment;
import com.example.medicalinter.model.AppointmentStatus;
import com.example.medicalinter.repository.AvailabilityScheduleRepository;
import com.example.medicalinter.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AvailabilityScheduleService {
    
    @Autowired
    private AvailabilityScheduleRepository scheduleRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private ProfessionalService professionalService;
    
    public AvailabilitySchedule createSchedule(AvailabilitySchedule schedule) {
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());
        return scheduleRepository.save(schedule);
    }
    
    public Optional<AvailabilitySchedule> findById(String id) {
        return scheduleRepository.findById(id);
    }
    
    public List<AvailabilitySchedule> getSchedulesByProfessional(String professionalId) {
        return scheduleRepository.findByProfessionalIdAndIsActive(professionalId, true);
    }
    
    public List<AvailabilitySchedule> getAllSchedulesByProfessional(String professionalId) {
        return scheduleRepository.findByProfessionalId(professionalId);
    }
    
    public AvailabilitySchedule updateSchedule(AvailabilitySchedule schedule) {
        schedule.setUpdatedAt(LocalDateTime.now());
        return scheduleRepository.save(schedule);
    }
    
    public void deleteSchedule(String id) {
        Optional<AvailabilitySchedule> scheduleOpt = scheduleRepository.findById(id);
        if (scheduleOpt.isPresent()) {
            AvailabilitySchedule schedule = scheduleOpt.get();
            schedule.setActive(false);
            schedule.setUpdatedAt(LocalDateTime.now());
            scheduleRepository.save(schedule);
        }
    }
    
    /**
     * Generate available time slots for a professional within a date range
     */
    public List<LocalDateTime> generateAvailableSlots(String professionalId, 
                                                     LocalDate startDate, 
                                                     LocalDate endDate) {
        List<LocalDateTime> availableSlots = new ArrayList<>();
        
        // Get active schedules for the professional
        List<AvailabilitySchedule> schedules = getSchedulesByProfessional(professionalId);
        
        if (schedules.isEmpty()) {
            return availableSlots;
        }
        
        // Get existing appointments to exclude booked slots
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        Optional<Professional> professionalOpt = professionalService.findById(professionalId);
        if (professionalOpt.isEmpty()) {
            return availableSlots;
        }
        
        List<Appointment> existingAppointments = appointmentRepository
            .findByProfessionalAndAppointmentDateTimeBetween(
                professionalOpt.get(), startDateTime, endDateTime);
        
        // Convert appointments to set of booked times for quick lookup
        List<LocalDateTime> bookedTimes = existingAppointments.stream()
            .filter(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED || 
                          apt.getStatus() == AppointmentStatus.CONFIRMED)
            .map(Appointment::getAppointmentDateTime)
            .collect(Collectors.toList());
        
        // Generate slots for each day in the range
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            final LocalDate dateForLambda = currentDate; // Make it effectively final for lambda
            int dayOfWeek = currentDate.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
            
            // Find schedules that apply to this day
            List<AvailabilitySchedule> daySchedules = schedules.stream()
                .filter(schedule -> schedule.getDaysOfWeek().contains(dayOfWeek))
                .filter(schedule -> schedule.isValidForDate(dateForLambda.atStartOfDay()))
                .collect(Collectors.toList());
            
            // Generate slots for each applicable schedule
            for (AvailabilitySchedule schedule : daySchedules) {
                List<LocalDateTime> daySlots = generateSlotsForDay(currentDate, schedule);
                
                // Filter out booked slots
                daySlots = daySlots.stream()
                    .filter(slot -> !bookedTimes.contains(slot))
                    .filter(slot -> slot.isAfter(LocalDateTime.now())) // Only future slots
                    .collect(Collectors.toList());
                
                availableSlots.addAll(daySlots);
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        // Sort and remove duplicates
        return availableSlots.stream()
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
    
    /**
     * Generate time slots for a specific day based on a schedule
     */
    private List<LocalDateTime> generateSlotsForDay(LocalDate date, AvailabilitySchedule schedule) {
        List<LocalDateTime> slots = new ArrayList<>();
        
        LocalTime currentTime = schedule.getStartTime();
        LocalTime endTime = schedule.getEndTime();
        int intervalMinutes = schedule.getIntervalMinutes();
        
        while (currentTime.isBefore(endTime)) {
            LocalDateTime slotDateTime = date.atTime(currentTime);
            slots.add(slotDateTime);
            currentTime = currentTime.plusMinutes(intervalMinutes);
        }
        
        return slots;
    }
    
    /**
     * Check if a specific time slot is available
     */
    public boolean isSlotAvailable(String professionalId, LocalDateTime requestedTime) {
        // Check if there's a schedule that covers this time
        List<AvailabilitySchedule> schedules = getSchedulesByProfessional(professionalId);
        
        boolean hasValidSchedule = schedules.stream()
            .anyMatch(schedule -> {
                int dayOfWeek = requestedTime.getDayOfWeek().getValue();
                return schedule.getDaysOfWeek().contains(dayOfWeek) &&
                       schedule.isValidForDate(requestedTime) &&
                       schedule.isTimeWithinRange(requestedTime.toLocalTime());
            });
        
        if (!hasValidSchedule) {
            return false;
        }
        
        // Check if the slot is not already booked
        Optional<Professional> professionalOpt = professionalService.findById(professionalId);
        if (professionalOpt.isEmpty()) {
            return false;
        }
        
        Optional<Appointment> existingAppointment = appointmentRepository
            .findByProfessionalAndTimeSlotAndStatus(
                professionalOpt.get(), 
                requestedTime.toString(), 
                AppointmentStatus.SCHEDULED);
        
        return existingAppointment.isEmpty();
    }
    
    /**
     * Get available slots for a specific date
     */
    public List<LocalDateTime> getAvailableSlotsForDate(String professionalId, LocalDate date) {
        return generateAvailableSlots(professionalId, date, date);
    }
    
    /**
     * Get next available slot for a professional
     */
    public Optional<LocalDateTime> getNextAvailableSlot(String professionalId) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(30); // Look ahead 30 days
        
        List<LocalDateTime> availableSlots = generateAvailableSlots(professionalId, today, endDate);
        
        return availableSlots.stream()
            .filter(slot -> slot.isAfter(LocalDateTime.now()))
            .findFirst();
    }
    
    /**
     * Get availability statistics for a professional
     */
    public AvailabilityStats getAvailabilityStats(String professionalId) {
        List<AvailabilitySchedule> schedules = getSchedulesByProfessional(professionalId);
        
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(30);
        List<LocalDateTime> availableSlots = generateAvailableSlots(professionalId, today, endDate);
        
        long totalSlots = availableSlots.size();
        long upcomingSlots = availableSlots.stream()
            .filter(slot -> slot.isAfter(LocalDateTime.now()))
            .count();
        
        Optional<LocalDateTime> nextSlot = getNextAvailableSlot(professionalId);
        
        return new AvailabilityStats(
            schedules.size(),
            totalSlots,
            upcomingSlots,
            nextSlot.orElse(null)
        );
    }
    
    // Inner class for availability statistics
    public static class AvailabilityStats {
        private final int activeSchedules;
        private final long totalSlots;
        private final long upcomingSlots;
        private final LocalDateTime nextAvailableSlot;
        
        public AvailabilityStats(int activeSchedules, long totalSlots, 
                               long upcomingSlots, LocalDateTime nextAvailableSlot) {
            this.activeSchedules = activeSchedules;
            this.totalSlots = totalSlots;
            this.upcomingSlots = upcomingSlots;
            this.nextAvailableSlot = nextAvailableSlot;
        }
        
        // Getters
        public int getActiveSchedules() { return activeSchedules; }
        public long getTotalSlots() { return totalSlots; }
        public long getUpcomingSlots() { return upcomingSlots; }
        public LocalDateTime getNextAvailableSlot() { return nextAvailableSlot; }
    }
}