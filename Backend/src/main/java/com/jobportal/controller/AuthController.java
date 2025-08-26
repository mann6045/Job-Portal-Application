package com.jobportal.controller;

import com.jobportal.model.User;
import com.jobportal.repository.UserRepository;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private BCryptPasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepo.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        String normalized = user.getRole() == null ? "JOBSEEKER" : user.getRole().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        user.setRole(normalized);
        
        user.setPassword(encoder.encode(user.getPassword()));
        User savedUser = userRepo.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Registered successfully",
            "user", createSafeUserResponse(savedUser)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpSession session) {
        User dbUser = userRepo.findByUsername(user.getUsername());
        System.out.println("Attempt login: " + user.getUsername());

        if (dbUser == null) {
            System.out.println("User not found");
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        if (!encoder.matches(user.getPassword(), dbUser.getPassword())) {
            System.out.println("Password does not match");
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        session.setAttribute("user", dbUser);
        System.out.println("Login success for: " + user.getUsername());
        return ResponseEntity.ok(createSafeUserResponse(dbUser));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        return ResponseEntity.ok(createSafeUserResponse(user));
    }

    private Map<String, Object> createSafeUserResponse(User user) {
        // return role without the ROLE_ prefix so frontend deals with ADMIN / JOBSEEKER / RECRUITER
        String role = user.getRole() == null ? "" : user.getRole().replace("ROLE_", "");
        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "role", role
        );
    }
}