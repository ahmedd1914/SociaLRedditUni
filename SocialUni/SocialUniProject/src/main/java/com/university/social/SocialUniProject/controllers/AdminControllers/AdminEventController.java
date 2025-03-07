package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.UpdateEventDto;
import com.university.social.SocialUniProject.responses.EventResponseDto;
import com.university.social.SocialUniProject.services.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/events")
public class AdminEventController {

    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    // Admin can view all events
    @GetMapping
    public ResponseEntity<List<EventResponseDto>> getAllEvents() {
        // For simplicity, you could combine public and group events
        List<EventResponseDto> events = eventService.getPublicEvents();
        return ResponseEntity.ok(events);
    }

    // Admin can update any event without restrictions
    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> updateEventByAdmin(@PathVariable Long eventId,
                                                               @RequestBody UpdateEventDto dto) {
        // Admin bypasses permission checks in the service layer (if implemented)
        EventResponseDto response = eventService.updateEvent(eventId, dto, eventService.getEventByIdDto(eventId).getOrganizerId());
        return ResponseEntity.ok(response);
    }

    // Admin can delete any event
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEventByAdmin(@PathVariable Long eventId) {
        // Admin deletion logic could be separate if needed.
        eventService.deleteEvent(eventId, eventService.getEventByIdDto(eventId).getOrganizerId());
        return ResponseEntity.ok().build();
    }
}
