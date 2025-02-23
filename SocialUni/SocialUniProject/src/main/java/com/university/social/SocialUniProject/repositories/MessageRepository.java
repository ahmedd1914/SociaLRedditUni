package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Message;
import com.university.social.SocialUniProject.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Retrieve messages for a specific receiver, ordered by sent time descending
    List<Message> findByReceiverOrderBySentAtDesc(User receiver);

    // Retrieve messages sent by a specific user, ordered by sent time descending
    List<Message> findBySenderOrderBySentAtDesc(User sender);

    // Retrieve conversation messages between a sender and a receiver, ordered ascending by sent time
    List<Message> findBySenderAndReceiverOrderBySentAtAsc(User sender, User receiver);

    List<Message> findBySender_IdAndReceiver_IdOrSender_IdAndReceiver_IdOrderBySentAtAsc(
            Long senderId1, Long receiverId1, Long senderId2, Long receiverId2);

}
