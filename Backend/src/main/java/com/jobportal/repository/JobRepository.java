package com.jobportal.repository;

import com.jobportal.model.Job;
import com.jobportal.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // ✅ Add this method
    List<Job> findByTitleContainingIgnoreCase(String title);

    // (Optional) You can also add filters like:
    List<Job> findByLocationContainingIgnoreCase(String location);

    List<Job> findBySkillsContainingIgnoreCase(String skills);
    
    List<Job> findByPostedBy(User user);
}