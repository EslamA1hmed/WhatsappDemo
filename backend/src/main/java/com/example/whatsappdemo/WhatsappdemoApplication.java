package com.example.whatsappdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WhatsappdemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(WhatsappdemoApplication.class, args);
	}

}
