package com.example.medicalinter.controller;

import com.example.medicalinter.model.Appointment;
import com.example.medicalinter.model.AppointmentStatus;
import com.example.medicalinter.model.Professional;
import com.example.medicalinter.model.User;
import com.example.medicalinter.service.AppointmentService;
import com.example.medicalinter.service.ProfessionalService;
import com.example.medicalinter.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProfessionalService professionalService;

    // Book a new appointment
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        try {
            Optional<User> patientOpt = userService.findById(request.getPatientId());
            Optional<Professional> professionalOpt = professionalService.findById(request.getProfessionalId());

            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Patient not found"));
            }

            if (professionalOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Professional not found"));
            }

            LocalDateTime appointmentDateTime = LocalDateTime.parse(request.getAppointmentDateTime(), 
                DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            Appointment appointment = appointmentService.bookAppointment(
                patientOpt.get(), 
                professionalOpt.get(), 
                appointmentDateTime, 
                request.getTimeSlot(), 
                request.getReason()
            );

            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable String id) {
        try {
            Optional<Appointment> appointment = appointmentService.findById(id);
            return appointment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Patient endpoints
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        try {
            List<Appointment> appointments = appointmentService.getPatientAppointments(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/patient/{patientId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingPatientAppointments(@PathVariable String patientId) {
        try {
            List<Appointment> appointments = appointmentService.getUpcomingPatientAppointments(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<Appointment>> getPatientAppointmentsByStatus(
            @PathVariable String patientId, @PathVariable AppointmentStatus status) {
        try {
            Optional<User> patientOpt = userService.findById(patientId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<Appointment> appointments = appointmentService.getPatientAppointmentsByStatus(patientOpt.get(), status);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Professional endpoints
    @GetMapping("/professional/{professionalId}")
    public ResponseEntity<List<Appointment>> getProfessionalAppointments(@PathVariable String professionalId) {
        try {
            List<Appointment> appointments = appointmentService.getProfessionalAppointments(professionalId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/professional/{professionalId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingProfessionalAppointments(@PathVariable String professionalId) {
        try {
            List<Appointment> appointments = appointmentService.getUpcomingProfessionalAppointments(professionalId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/professional/{professionalId}/status/{status}")
    public ResponseEntity<List<Appointment>> getProfessionalAppointmentsByStatus(
            @PathVariable String professionalId, @PathVariable AppointmentStatus status) {
        try {
            Optional<Professional> professionalOpt = professionalService.findById(professionalId);
            if (professionalOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<Appointment> appointments = appointmentService.getProfessionalAppointmentsByStatus(professionalOpt.get(), status);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update appointment
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable String id, @Valid @RequestBody UpdateAppointmentRequest request) {
        try {
            LocalDateTime newDateTime = LocalDateTime.parse(request.getAppointmentDateTime(), 
                DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            Appointment updated = appointmentService.updateAppointment(
                id, 
                newDateTime, 
                request.getTimeSlot(), 
                request.getReason()
            );

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Cancel appointment
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable String id, @RequestBody CancelAppointmentRequest request) {
        try {
            Appointment cancelled = appointmentService.cancelAppointment(id, request.getUserId());
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Confirm appointment (professional action)
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable String id) {
        try {
            Appointment confirmed = appointmentService.confirmAppointment(id);
            return ResponseEntity.ok(confirmed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Complete appointment (professional action)
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable String id) {
        try {
            Appointment completed = appointmentService.completeAppointment(id);
            return ResponseEntity.ok(completed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get appointments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByStatus(status);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Inner classes for request objects
    public static class BookAppointmentRequest {
        private String patientId;
        private String professionalId;
        private String appointmentDateTime;
        private String timeSlot;
        private String reason;

        // Getters and setters
        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }
        public String getProfessionalId() { return professionalId; }
        public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
        public String getAppointmentDateTime() { return appointmentDateTime; }
        public void setAppointmentDateTime(String appointmentDateTime) { this.appointmentDateTime = appointmentDateTime; }
        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class UpdateAppointmentRequest {
        private String appointmentDateTime;
        private String timeSlot;
        private String reason;

        // Getters and setters
        public String getAppointmentDateTime() { return appointmentDateTime; }
        public void setAppointmentDateTime(String appointmentDateTime) { this.appointmentDateTime = appointmentDateTime; }
        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class CancelAppointmentRequest {
        private String userId;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
} 