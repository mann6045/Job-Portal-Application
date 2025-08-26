package com.jobportal.repository;

import com.jobportal.model.Resume;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
	List<Resume> findByUser(User user);
}