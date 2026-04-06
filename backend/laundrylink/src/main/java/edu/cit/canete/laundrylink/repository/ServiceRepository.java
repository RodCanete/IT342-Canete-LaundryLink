package edu.cit.canete.laundrylink.repository;

import edu.cit.canete.laundrylink.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {
    List<Service> findByShop_Id(UUID shopId);
}