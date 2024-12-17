"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { fetchAIResponse } from "../actions/llm";
import { AiOutlineSend } from "react-icons/ai";
import ChatBox from "./ChatBox";
export interface Message {
  type: "user" | "ai";
  value: string;
}

const Main = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchQueryResponse = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { type: "user", value: input };
    setConversation((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await fetchAIResponse(input);
      const aiMessage: Message = { type: "ai", value: aiResponse };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="chat-container">
      <Box className="chat-header">
        <Typography variant="h5" component="h1" className="text-white">
          Mani's Personal Assistant
        </Typography>
      </Box>
      <Box className="chat-box">
        {conversation.map((message, index) => (
          <ChatBox key={index} {...message} />
        ))}
        {isLoading && (
          <Box className="chat-loading">
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      <Box className="chat-input">
        <input
          type="text"
          placeholder="Enter your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchQueryResponse();
          }}
          className="chat-input-field"
        />
        <button
          onClick={fetchQueryResponse}
          disabled={isLoading}
          className="chat-send-button flex"
        >
          {isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <AiOutlineSend size={20} />
          )}
        </button>
        {/* <TextField
          label="Enter your message"
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchQueryResponse();
          }}
        />
        <Button
          variant="contained"
          onClick={fetchQueryResponse}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <AiOutlineSend size={20} />
          )}
        </Button> */}
      </Box>
    </Box>
  );
};

export default Main;
