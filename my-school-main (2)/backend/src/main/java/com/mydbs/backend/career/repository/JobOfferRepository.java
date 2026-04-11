package com.mydbs.backend.career.repository;

import com.mydbs.backend.career.model.JobOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    Page<JobOffer> findByStatusAndArchivedFalseOrderByApplicationDeadlineAsc(String status, Pageable pageable);

    @Query("SELECT j FROM JobOffer j WHERE j.archived = false AND j.status = 'OPEN' " +
           "AND (j.applicationDeadline IS NULL OR j.applicationDeadline >= :today) " +
           "AND (:type IS NULL OR j.offerType = :type) " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobOffer> searchOpen(@Param("today") LocalDate today,
                               @Param("type") String type,
                               @Param("keyword") String keyword,
                               Pageable pageable);
}
