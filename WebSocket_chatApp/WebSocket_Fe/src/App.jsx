/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./App.css";

// Import thư viện WebSocket
import SockJS from "sockjs-client"; // Thư viện tạo kết nối WebSocket
import { Client } from "@stomp/stompjs"; // Thư viện STOMP client để giao tiếp với WebSocket server

// Import các component Material-UI
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";

function App() {
  // State quản lý dữ liệu
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [message, setMessage] = useState(""); // Nội dung tin nhắn đang nhập
  const [nickname, setNickname] = useState(""); // Nickname của người dùng
  const [stompClient, setStompClient] = useState(null); // Client WebSocket

  // useEffect để thiết lập kết nối WebSocket khi component mount
  useEffect(() => {
    // Tạo kết nối WebSocket đến server
    const socket = new WebSocket("ws://localhost:8080/ws");

    // Tạo STOMP client với các cấu hình
    const client = new Client({
      webSocketFactory: () => socket, // Factory function tạo WebSocket
      debug: (str) => {
        console.log(str); // Log debug thông tin
      },
      reconnectDelay: 5000, // Tự động kết nối lại sau 5 giây nếu mất kết nối
      heartbeatIncoming: 4000, // Kiểm tra kết nối mỗi 4 giây
      heartbeatOutgoing: 4000, // Gửi heartbeat mỗi 4 giây

      // Callback khi kết nối thành công
      onConnect: () => {
        // Đăng ký lắng nghe tin nhắn mới từ topic "/topic/messages"
        client.subscribe("/topic/messages", (message) => {
          const newMessage = JSON.parse(message.body); // Parse tin nhắn từ JSON
          setMessages((prevMessages) => [...prevMessages, newMessage]); // Thêm tin nhắn mới vào state
        });
      },

      // Callback khi có lỗi STOMP
      onStompError: (frame) => {
        console.error("Broker error: ", frame.headers["message"]);
      },
    });

    // Kích hoạt client và lưu vào state
    client.activate();
    setStompClient(client);

    // Cleanup function: ngắt kết nối khi component unmount
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // Xử lý thay đổi nickname
  const handleNickNameChange = (e) => {
    setNickname(e.target.value);
  };

  // Xử lý thay đổi nội dung tin nhắn
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Gửi tin nhắn
  const sendMessage = () => {
    // Kiểm tra điều kiện trước khi gửi
    if (message.trim() && stompClient && stompClient.connected) {
      // Tạo object tin nhắn
      const chatMessage = {
        nickname,
        content: message,
      };

      // Gửi tin nhắn đến endpoint "/app/chat"
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage),
      });

      // Reset input sau khi gửi
      setMessage("");
    }
  };

  // Render UI
  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 2 }}>
      {/* Danh sách tin nhắn */}
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            {/* Avatar hiển thị chữ cái đầu của nickname */}
            <ListItemAvatar>
              <Avatar>{msg.nickname?.charAt(0).toUpperCase()}</Avatar>
            </ListItemAvatar>
            {/* Nội dung tin nhắn */}
            <ListItemText
              primary={
                <Typography variant="subtitle1" gutterBottom>
                  {msg.nickname}
                </Typography>
              }
              secondary={
                <Typography variant="body1" gutterBottom>
                  {msg.content}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Form nhập tin nhắn */}
      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        {/* Input nickname */}
        <TextField
          label="Nickname"
          variant="outlined"
          value={nickname}
          onChange={handleNickNameChange}
          sx={{ mr: 1 }}
        />
        {/* Input nội dung tin nhắn */}
        <TextField
          label="Message"
          variant="outlined"
          value={message}
          onChange={handleMessageChange}
          sx={{ mr: 1, flexGrow: 1 }}
        />
        {/* Nút gửi tin nhắn */}
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          disabled={!message.trim() || !stompClient?.connected}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default App;
