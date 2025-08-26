package com.jobportal.controller;

import com.jobportal.model.Resume;
import com.jobportal.model.User;
import com.jobportal.repository.ResumeRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeRepository resumeRepo;

    @PostMapping("/upload")
    public String uploadResume(@RequestParam("file") MultipartFile file,
                                @RequestParam(required = false) String name,
                                @RequestParam(required = false) String graduation,
                                @RequestParam(required = false) String projectDetails,
                                HttpSession session) throws IOException {

        User user = (User) session.getAttribute("user");
        if (user == null) return "Unauthorized";

        Resume resume = new Resume();
        resume.setName(name);
        resume.setGraduation(graduation);
        resume.setProjectDetails(projectDetails);
        resume.setFileName(StringUtils.cleanPath(file.getOriginalFilename()));
        resume.setContentType(file.getContentType());
        resume.setData(file.getBytes());
        resume.setUser(user);

        resumeRepo.save(resume);
        return "Resume uploaded successfully to DB!";
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> viewResume(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Resume resume = resumeRepo.findById(id).orElse(null);
        if (resume == null || !resume.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"" + resume.getFileName() + "\"")
                .header("Content-Type", resume.getContentType() != null ? resume.getContentType() : "application/octet-stream")
                .body(resume.getData());
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> listResumes(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Resume> resumes = resumeRepo.findByUser(user);

        List<Map<String, Object>> result = resumes.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("name", r.getName());
            map.put("graduation", r.getGraduation());
            map.put("projectDetails", r.getProjectDetails());
            map.put("fileName", r.getFileName());
            map.put("viewUrl", "/api/resume/view/" + r.getId());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }
}