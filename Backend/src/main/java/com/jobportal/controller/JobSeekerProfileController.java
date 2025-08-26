package com.jobportal.controller;

import com.jobportal.model.JobSeekerProfile;
import com.jobportal.model.User;
import com.jobportal.repository.JobSeekerProfileRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/profile")
public class JobSeekerProfileController {

    @Autowired
    private JobSeekerProfileRepository profileRepo;

    @PostMapping("/save")
    public String saveProfile(@RequestParam("fullName") String fullName,
                              @RequestParam("email") String email,
                              @RequestParam("mobileNo") String mobileNo,
                              @RequestParam("education") String education,
                              @RequestParam(value = "resume", required = false) MultipartFile resumeFile,
                              HttpSession session) throws IOException {

        User currentUser = (User) session.getAttribute("user");

        if (currentUser == null) {
            return "Not logged in!";
        }

        String role = currentUser.getRole() == null ? "" : currentUser.getRole().replace("ROLE_", "");
        if (!"JOBSEEKER".equalsIgnoreCase(role)) {
            return "Only job seekers can create a profile!";
        }

        JobSeekerProfile profile = profileRepo.findByUser(currentUser);
        if (profile == null) {
            profile = new JobSeekerProfile();
            profile.setUser(currentUser);
        }

        profile.setFullName(fullName);
        profile.setEmail(email);
        profile.setMobileNo(mobileNo);
        profile.setEducation(education);

        if (resumeFile != null && !resumeFile.isEmpty()) {
            profile.setFileName(StringUtils.cleanPath(resumeFile.getOriginalFilename()));
            profile.setContentType(resumeFile.getContentType());
            profile.setResumeData(resumeFile.getBytes());
        }

        profileRepo.save(profile);
        return "Profile saved successfully!";
    }

    @GetMapping("/me")
    public JobSeekerProfile getMyProfile(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return null;
        }
        return profileRepo.findByUser(currentUser);
    }

    @GetMapping("/resume")
    public ResponseEntity<byte[]> downloadResume(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        JobSeekerProfile profile = profileRepo.findByUser(currentUser);
        if (profile == null || profile.getResumeData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + profile.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(profile.getContentType()))
                .body(profile.getResumeData());
    }
    @PostMapping("/uploadResume")
    public ResponseEntity<?> uploadResumeOnly(@RequestParam("resume") MultipartFile resumeFile,
                                              HttpSession session) throws IOException {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) return ResponseEntity.status(401).body("Not logged in");

        String role = currentUser.getRole() == null ? "" : currentUser.getRole().replace("ROLE_", "");
        if (!"JOBSEEKER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Only job seekers allowed");
        }

        JobSeekerProfile profile = profileRepo.findByUser(currentUser);
        if (profile == null) {
            profile = new JobSeekerProfile();
            profile.setUser(currentUser);
        }

        if (resumeFile != null && !resumeFile.isEmpty()) {
            profile.setFileName(StringUtils.cleanPath(resumeFile.getOriginalFilename()));
            profile.setContentType(resumeFile.getContentType());
            profile.setResumeData(resumeFile.getBytes());
            profileRepo.save(profile);
            return ResponseEntity.ok("Resume uploaded into profile");
        }
        return ResponseEntity.badRequest().body("No file");
    }
    @GetMapping("/resume/{userId}")
    public ResponseEntity<?> downloadResumeByUserId(@PathVariable Long userId, HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }

        // Only ADMIN or RECRUITER roles allowed
        String role = currentUser.getRole();
        if (!"ADMIN".equalsIgnoreCase(role.replace("ROLE_", ""))
                && !"RECRUITER".equalsIgnoreCase(role.replace("ROLE_", ""))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        JobSeekerProfile profile = profileRepo.findByUser(new User(userId));
        if (profile == null || profile.getResumeData() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resume not found");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(profile.getContentType()));
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(profile.getFileName())
                .build());

        return new ResponseEntity<>(profile.getResumeData(), headers, HttpStatus.OK);
    }
}