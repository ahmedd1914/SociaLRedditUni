package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateEventDto;
import com.university.social.SocialUniProject.dto.UpdateEventDto;
import com.university.social.SocialUniProject.responses.EventResponseDto;
import com.university.social.SocialUniProject.services.EventService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/create")
    public ResponseEntity<EventResponseDto> createEvent(@RequestBody CreateEventDto dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        EventResponseDto response = eventService.createEvent(dto, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> updateEvent(@PathVariable Long eventId,
                                                        @RequestBody UpdateEventDto dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        EventResponseDto response = eventService.updateEvent(eventId, dto, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        eventService.deleteEvent(eventId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/rsvp")
    public ResponseEntity<String> rsvpEvent(@PathVariable Long eventId,
                                            @RequestParam boolean willAttend,
                                            @RequestParam(defaultValue = "false") boolean maybe) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        String message = eventService.rsvpEvent(eventId, userId, willAttend, maybe);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/{eventId}/invite/{inviteeId}")
    public ResponseEntity<Void> inviteUser(@PathVariable Long eventId,
                                           @PathVariable Long inviteeId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        eventService.inviteUser(eventId, inviteeId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> getEvent(@PathVariable Long eventId) {
        EventResponseDto response = eventService.getEventByIdDto(eventId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public")
    public ResponseEntity<List<EventResponseDto>> getPublicEvents() {
        List<EventResponseDto> events = eventService.getPublicEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<EventResponseDto>> getEventsByGroup(@PathVariable Long groupId) {
        List<EventResponseDto> events = eventService.getEventsByGroup(groupId);
        return ResponseEntity.ok(events);
    }
}
