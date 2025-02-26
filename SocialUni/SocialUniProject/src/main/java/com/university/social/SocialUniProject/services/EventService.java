package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.dto.CreateEventDto;
import com.university.social.SocialUniProject.dto.UpdateEventDto;
import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.exceptions.UnauthorizedActionException;
import com.university.social.SocialUniProject.models.Event;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.enums.EventStatus;
import com.university.social.SocialUniProject.repositories.EventRepository;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.EventResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Helper methods
    private Event findEventById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    private Group findGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));
    }

    // Create an event. The creator becomes the organizer.
    public EventResponseDto createEvent(CreateEventDto dto, Long userId) {
        User organizer = findUserById(userId);

        Event event = Event.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .date(dto.getDate())
                .location(dto.getLocation())
                .organizer(organizer)
                .category(dto.getCategory())
                .status(EventStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // If the event is associated with a group, set it
        if (dto.getGroupId() != null) {
            Group group = findGroupById(dto.getGroupId());
            event.setGroup(group);
        }

        Event savedEvent = eventRepository.save(event);

        // Trigger notification for event creation
        notificationService.createNotification(new CreateNotificationDto(
                "Your event '" + savedEvent.getName() + "' has been created.",
                com.university.social.SocialUniProject.enums.NotificationType.EVENT_CREATED,
                organizer.getId(),
                savedEvent.getId(),
                null
        ));

        return convertToDto(savedEvent);
    }

    // Update event; only allowed for organizer or redactors
    public EventResponseDto updateEvent(Long eventId, UpdateEventDto dto, Long userId) {
        Event event = findEventById(eventId);
        if (!event.getOrganizer().getId().equals(userId) &&
                (event.getRedactors() == null || event.getRedactors().stream().noneMatch(u -> u.getId().equals(userId)))) {
            throw new UnauthorizedActionException("You do not have permission to update this event.");
        }

        // Update allowed fields
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setDate(dto.getDate());
        event.setLocation(dto.getLocation());
        event.setCategory(dto.getCategory());
        if (dto.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(dto.getStatus()));
        }
        event.setUpdatedAt(LocalDateTime.now());
        Event updatedEvent = eventRepository.save(event);

        // Trigger notification to organizer (and redactors) about update
        notificationService.createNotification(new CreateNotificationDto(
                "Your event '" + updatedEvent.getName() + "' has been updated.",
                com.university.social.SocialUniProject.enums.NotificationType.EVENT_UPDATED,
                event.getOrganizer().getId(),
                updatedEvent.getId(),
                null
        ));

        return convertToDto(updatedEvent);
    }

    // Delete event; only allowed for organizer or redactors
    public void deleteEvent(Long eventId, Long userId) {
        Event event = findEventById(eventId);
        if (!event.getOrganizer().getId().equals(userId) &&
                (event.getRedactors() == null || event.getRedactors().stream().noneMatch(u -> u.getId().equals(userId)))) {
            throw new UnauthorizedActionException("You do not have permission to delete this event.");
        }
        eventRepository.delete(event);

        // Notify organizer about deletion (could notify invited users too)
        notificationService.createNotification(new CreateNotificationDto(
                "Your event '" + event.getName() + "' has been deleted.",
                com.university.social.SocialUniProject.enums.NotificationType.EVENT_DELETED,
                event.getOrganizer().getId(),
                event.getId(),
                null
        ));
    }
    // Automatically update event status from SCHEDULED to COMPLETED if the event date has passed.
    @Scheduled(cron = "0 0 * * * *") // Runs every hour (adjust as needed)
    public void updatePastEventsStatus() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> eventsToUpdate = eventRepository.findByStatusAndDateBefore(EventStatus.SCHEDULED, now);
        for (Event event : eventsToUpdate) {
            event.setStatus(EventStatus.COMPLETED);
            event.setUpdatedAt(now);
            eventRepository.save(event);
            notificationService.createNotification(new CreateNotificationDto(
                    "Your event '" + event.getName() + "' has been marked as completed.",
                    com.university.social.SocialUniProject.enums.NotificationType.EVENT_UPDATED,
                    event.getOrganizer().getId(),
                    event.getId(),
                    null
            ));
        }
    }

    // RSVP logic: Users update their RSVP (Will Attend, Maybe, Will Not Attend)
    public String rsvpEvent(Long eventId, Long userId, boolean willAttend, boolean isMaybe) {
        Event event = findEventById(eventId);
        User user = findUserById(userId);

        // Remove user from all RSVP lists
        if (event.getWillAttend() != null) event.getWillAttend().remove(user);
        if (event.getWillNotAttend() != null) event.getWillNotAttend().remove(user);
        if (event.getMaybeAttend() != null) event.getMaybeAttend().remove(user);

        if (isMaybe) {
            event.getMaybeAttend().add(user);
        } else if (willAttend) {
            event.getWillAttend().add(user);
        } else {
            event.getWillNotAttend().add(user);
        }
        eventRepository.save(event);

        // Notify organizer of RSVP change
        notificationService.createNotification(new CreateNotificationDto(
                user.getUsername() + " has updated their RSVP for your event '" + event.getName() + "'.",
                com.university.social.SocialUniProject.enums.NotificationType.EVENT_RSVP,
                event.getOrganizer().getId(),
                event.getId(),
                null
        ));
        return "RSVP updated";
    }

    // Invite user to event. Only organizer or redactors can invite.
    public void inviteUser(Long eventId, Long inviteeId, Long userId) {
        Event event = findEventById(eventId);
        if (!event.getOrganizer().getId().equals(userId) &&
                (event.getRedactors() == null || event.getRedactors().stream().noneMatch(u -> u.getId().equals(userId)))) {
            throw new UnauthorizedActionException("You do not have permission to invite users to this event.");
        }
        User invitee = findUserById(inviteeId);
        // For simplicity, we assume invitation is done by sending a notification.
        notificationService.createNotification(new CreateNotificationDto(
                "You are invited to the event '" + event.getName() + "'.",
                com.university.social.SocialUniProject.enums.NotificationType.EVENT_INVITATION,
                invitee.getId(),
                event.getId(),
                null
        ));
    }

    // Get event details as DTO
    public EventResponseDto getEventByIdDto(Long eventId) {
        Event event = findEventById(eventId);
        return convertToDto(event);
    }

    // Get public events (i.e. events without a group)
    public List<EventResponseDto> getPublicEvents() {
        return eventRepository.findByGroupIsNull().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get events by group
    public List<EventResponseDto> getEventsByGroup(Long groupId) {
        return eventRepository.findByGroupId(groupId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- Conversion Method ---
    private EventResponseDto convertToDto(Event event) {
        // You can expand this DTO conversion as needed.
        return EventResponseDto.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .date(event.getDate())
                .location(event.getLocation())
                .organizerId(event.getOrganizer().getId())
                .groupId(event.getGroup() != null ? event.getGroup().getId() : null)
                .category(event.getCategory())
                .status(event.getStatus())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
