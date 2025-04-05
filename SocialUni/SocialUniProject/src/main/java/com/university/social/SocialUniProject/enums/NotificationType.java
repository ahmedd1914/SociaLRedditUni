package com.university.social.SocialUniProject.enums;

public enum NotificationType {
    // Post-related
    POST_CREATED("Someone created a post"),
    POST_COMMENTED("Someone commented on your post"),
    POST_REACTED("Someone reacted to your post"),
    POST_DELETED_BY_ADMIN("Your post was deleted by an administrator"),
    POST_UPDATED_BY_ADMIN("Your post was updated by an administrator"),

    // Comment-related
    COMMENT_REACTED("Someone reacted to your comment"),
    COMMENT_REPLIED("Someone replied to your comment"),
    COMMENT_DELETED("Your comment was deleted"),
    COMMENT_UPDATED("Your comment was updated"),

    // Group-related
    GROUP_CREATED("Someone created a group"),
    GROUP_JOIN_REQUEST("Someone requested to join your group"),
    GROUP_JOIN_APPROVED("Your group join request was approved"),
    GROUP_MEMBER_JOINED("Someone joined your group"),
    GROUP_DELETED("Your group was deleted"),
    GROUP_DELETED_BY_ADMIN("Your group was deleted by an administrator"),

    // Event-related
    EVENT_CREATED("Someone created an event"),
    EVENT_INVITATION("Someone invited you to an event"),
    EVENT_CANCELLED("An event you're attending was cancelled"),
    EVENT_REMINDER("Reminder: You have an upcoming event"),
    EVENT_DELETED("An event you're attending was deleted"),
    EVENT_DELETED_BY_ADMIN("An event you're attending was deleted by an administrator"),
    EVENT_UPDATED("An event you're attending was updated"),

    // User-related
    USER_REGISTERED("Welcome to SocialUni! Please verify your email to get started."),
    USER_BANNED_BY_ADMIN("Your account has been banned by an administrator");

    private final String defaultMessage;

    NotificationType(String defaultMessage) {
        this.defaultMessage = defaultMessage;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}