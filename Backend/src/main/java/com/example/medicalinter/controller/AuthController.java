package com.example.medicalinter.controller;

import com.example.medicalinter.config.JwtUtils;
import com.example.medicalinter.model.User;
import com.example.medicalinter.model.UserType;
import com.example.medicalinter.model.Professional;
import com.example.medicalinter.service.UserService;
import com.example.medicalinter.service.ProfessionalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProfessionalService professionalService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User not found!"));
            }

            User user = userOpt.get();
            
            if (!userService.validatePassword(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid password!"));
            }

            String jwt = jwtUtils.generateJwtToken(user.getId(), user.getEmail(), user.getUserType().toString());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("userType", user.getUserType());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientRegistrationRequest registrationRequest) {
        try {
            if (userService.existsByEmail(registrationRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
            }

            User user = new User(
                registrationRequest.getEmail(),
                registrationRequest.getPassword(),
                registrationRequest.getFirstName(),
                registrationRequest.getLastName(),
                registrationRequest.getPhoneNumber(),
                UserType.PATIENT
            );

            User savedUser = userService.registerUser(user);

            return ResponseEntity.ok(new MessageResponse("Patient registered successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register/professional")
    public ResponseEntity<?> registerProfessional(@Valid @RequestBody ProfessionalRegistrationRequest registrationRequest) {
        try {
            if (userService.existsByEmail(registrationRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
            }

            if (professionalService.existsByLicenseNumber(registrationRequest.getLicenseNumber())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: License number is already in use!"));
            }

            // Create user account
            User user = new User(
                registrationRequest.getEmail(),
                registrationRequest.getPassword(),
                registrationRequest.getFirstName(),
                registrationRequest.getLastName(),
                registrationRequest.getPhoneNumber(),
                UserType.PROFESSIONAL
            );

            User savedUser = userService.registerUser(user);

            // Create professional profile
            Professional professional = new Professional(savedUser, 
                registrationRequest.getSpecialization(), 
                registrationRequest.getLicenseNumber());
            
            professional.setDescription(registrationRequest.getDescription());
            professional.setAddress(registrationRequest.getAddress());
            professional.setConsultationFee(registrationRequest.getConsultationFee());

            professionalService.registerProfessional(professional);

            return ResponseEntity.ok(new MessageResponse("Professional registered successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Inner classes for request/response objects
    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class PatientRegistrationRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String phoneNumber;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    public static class ProfessionalRegistrationRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private String specialization;
        private String licenseNumber;
        private String description;
        private String address;
        private Double consultationFee;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Double getConsultationFee() { return consultationFee; }
        public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }
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