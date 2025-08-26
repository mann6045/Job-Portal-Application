package com.jobportal.repository;

import com.jobportal.model.JobSeekerProfile;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobSeekerProfileRepository extends JpaRepository<JobSeekerProfile, Long> {
	JobSeekerProfile findByUser(User user);

	JobSeekerProfile findByUserId(Long userId);
}
