package webSocket.webSocket.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatMessage {
private String nickname;
private String content;
private Date timestamp;
}
