package com.example.whatsappdemo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.whatsappdemo.entity.Message;

@Repository
public interface MessageRepo extends JpaRepository<Message,Long> {
    
}
