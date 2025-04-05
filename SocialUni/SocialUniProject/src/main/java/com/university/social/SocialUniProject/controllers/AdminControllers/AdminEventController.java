package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.UpdateEventDto;
import com.university.social.SocialUniProject.responses.EventResponseDto;
import com.university.social.SocialUniProject.services.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/events")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminEventController {

    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    // Admin can view all events
    @GetMapping
    public ResponseEntity<java.util.List<EventResponseDto>> getAllEvents() {
        // For simplicity, you could combine public and group events
        java.util.List<EventResponseDto> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // Admin can view a specific event
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> getEventById(@PathVariable Long eventId) {
        EventResponseDto event = eventService.getEventById(eventId);
        return ResponseEntity.ok(event);
    }

    // Admin can update any event without restrictions
    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> updateEventByAdmin(@PathVariable Long eventId,
                                                               @RequestBody UpdateEventDto dto) {
        // Admin bypasses permission checks in the service layer (if implemented)
        EventResponseDto response = eventService.updateEventAsAdmin(eventId, dto);
        return ResponseEntity.ok(response);
    }

    // Admin can delete any event
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEventByAdmin(@PathVariable Long eventId) {
        // Admin deletion logic could be separate if needed.
        eventService.deleteEventAsAdmin(eventId);
        return ResponseEntity.ok().build();
    }
}
