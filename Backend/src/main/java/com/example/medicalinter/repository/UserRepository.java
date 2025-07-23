package com.example.medicalinter.repository;

import com.example.medicalinter.model.User;
import com.example.medicalinter.model.UserType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    List<User> findByUserType(UserType userType);
    
    Optional<User> findByEmailAndUserType(String email, UserType userType);
    
    boolean existsByEmail(String email);
    
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);
} 