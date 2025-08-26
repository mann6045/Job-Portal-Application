package com.jobportal.controller;

import com.jobportal.model.User;
import com.jobportal.model.Job;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.JobRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired UserRepository userRepo;
    @Autowired JobRepository jobRepo;

    private boolean isAdmin(User u) {
        if (u == null || u.getRole() == null) return false;
        return "ADMIN".equals(u.getRole().replace("ROLE_", ""));
    }

    @GetMapping("/users")
    public List<User> allUsers(HttpSession session) {
        User u = (User) session.getAttribute("user");
        if (!isAdmin(u)) throw new RuntimeException("Forbidden");
        return userRepo.findAll();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id, HttpSession session) {
        User u = (User) session.getAttribute("user");
        if (!isAdmin(u)) throw new RuntimeException("Forbidden");
        userRepo.deleteById(id);
    }

    @GetMapping("/jobs")
    public List<Job> allJobs(HttpSession session) {
        User u = (User) session.getAttribute("user");
        if (!isAdmin(u)) throw new RuntimeException("Forbidden");
        return jobRepo.findAll();
    }

    @DeleteMapping("/jobs/{id}")
    public void deleteJob(@PathVariable Long id, HttpSession session) {
        User u = (User) session.getAttribute("user");
        if (!isAdmin(u)) throw new RuntimeException("Forbidden");
        jobRepo.deleteById(id);
    }
}