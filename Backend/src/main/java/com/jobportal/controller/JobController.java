package com.jobportal.controller;

import com.jobportal.model.Job;
import com.jobportal.model.JobSeekerProfile;
import com.jobportal.model.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.JobSeekerProfileRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobSeekerProfileRepository profileRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createJob(@RequestBody Job job, HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
        job.setPostedBy(currentUser);
        Job savedJob = jobRepository.save(job);
        return ResponseEntity.ok(savedJob);
    }

    @GetMapping("/all")
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @GetMapping("/filter")
    public List<Job> filterJobs(@RequestParam(required = false) String title,
                                @RequestParam(required = false) String location,
                                @RequestParam(required = false) String skill) {
        if (title != null)
            return jobRepository.findByTitleContainingIgnoreCase(title);
        else if (location != null)
            return jobRepository.findByLocationContainingIgnoreCase(location);
        else if (skill != null)
            return jobRepository.findBySkillsContainingIgnoreCase(skill);
        else
            return jobRepository.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id))
            return "Job not found!";
        jobRepository.deleteById(id);
        return "Job deleted successfully!";
    }

    @GetMapping("/my-jobs")
    public List<Job> getMyJobs(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return List.of();
        return jobRepository.findByPostedBy(user);
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyToJob(@PathVariable Long jobId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        JobSeekerProfile profile = profileRepository.findByUser(user);
        if (profile == null)
            return ResponseEntity.badRequest().body("Profile not found");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.badRequest().body("Job not found");

        if (!profile.getAppliedJobIds().contains(jobId)) {
            profile.getAppliedJobIds().add(jobId);
            profileRepository.save(profile);
        }
        if (!job.getApplicantIds().contains(user.getId())) {
            job.getApplicantIds().add(user.getId());
            jobRepository.save(job);
        }

        return ResponseEntity.ok("Applied successfully");
    }

    // ADDED: Return applicants for a job with userId included
    @GetMapping("/applicants/{jobId}")
    public ResponseEntity<?> getApplicantsForJob(@PathVariable Long jobId, HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.badRequest().body("Job not found");

        // Only the recruiter who posted or admin can see applicants
        if (!job.getPostedBy().getId().equals(currentUser.getId())
                && !"ADMIN".equalsIgnoreCase(currentUser.getRole().replace("ROLE_", ""))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        List<Map<String, Object>> applicants = new ArrayList<>();
        for (Long userId : job.getApplicantIds()) {
            JobSeekerProfile profile = profileRepository.findByUser(new User(userId));
            if (profile != null) {
                Map<String, Object> map = new HashMap<>();
                map.put("userId", profile.getUser().getId()); // ADDED userId for frontend resume link
                map.put("fullName", profile.getFullName());
                map.put("email", profile.getEmail());
                map.put("mobileNo", profile.getMobileNo());
                map.put("education", profile.getEducation());
                applicants.add(map);
            }
        }
        return ResponseEntity.ok(applicants);
    }

    // ADDED: Admin view all jobs and applications
    @GetMapping("/applications/all")
    public ResponseEntity<?> getAllApplications(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole().replace("ROLE_", ""))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }
        return ResponseEntity.ok(jobRepository.findAll());
    }
}