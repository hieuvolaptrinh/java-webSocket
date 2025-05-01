package webSocket.webSocket.Controller;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import webSocket.webSocket.Model.ChatMessage;

import java.util.Date;

@Controller
public class ChatController {

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage chatMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(new Date());
        return chatMessage;
    }
}
