"use client";
import React, { useState, useRef, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { fetchAIResponse } from "../actions/llm";
import { AiOutlineSend } from "react-icons/ai";
import { motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import ChatBox from "./ChatBox";

export interface Message {
  type: "user" | "ai";
  value: string;
  timestamp: Date;
}

const Main = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What are Mani's top 3 projects?",
    "What technologies does Mani know?",
    "Tell me about Mani's experience",
    "What are the demo credentials?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchQueryResponse = async (query?: string) => {
    const questionText = query || input;
    if (!questionText.trim()) return;

    const userMessage: Message = {
      type: "user",
      value: questionText,
      timestamp: new Date(),
    };
    setConversation((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await fetchAIResponse(questionText);
      const aiMessage: Message = {
        type: "ai",
        value: aiResponse,
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        type: "ai",
        value:
          "<p style='color: #ef4444;'>Sorry, I encountered an error. Please try again.</p>",
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    fetchQueryResponse(question);
  };

  const clearConversation = () => {
    setConversation([]);
    setInput("");
  };

  const regenerateLastResponse = async () => {
    if (conversation.length < 2) return;

    const lastUserMessage = [...conversation]
      .reverse()
      .find((msg) => msg.type === "user");

    if (!lastUserMessage) return;

    const newConversation = conversation.slice(0, -1);
    setConversation(newConversation);

    setIsLoading(true);
    try {
      const aiResponse = await fetchAIResponse(lastUserMessage.value);
      const aiMessage: Message = {
        type: "ai",
        value: aiResponse,
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-full md:max-w-5xl h-screen md:h-[90vh] flex flex-col bg-white md:rounded-3xl shadow-none md:shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="header-gradient flex justify-between items-center px-4 md:px-5 py-3 md:py-4 md:rounded-t-3xl shadow-xl sticky top-0 z-10"
      >
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center cursor-pointer border-2 border-white/50 flex-shrink-0 shadow-lg"
          >
            <span className="text-xl md:text-2xl font-bold text-white">M</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-base md:text-lg lg:text-xl font-bold leading-tight truncate">
              Mani's AI Assistant
            </h1>
            <p className="text-white/95 text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
              Online • Ready to help
            </p>
          </div>
        </div>
        {conversation.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearConversation}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl text-white hover:bg-white/30 transition-colors flex-shrink-0 shadow-lg"
            title="Clear chat"
          >
            <MdClear size={20} className="md:hidden" />
            <MdClear size={22} className="hidden md:block" />
          </motion.button>
        )}
      </motion.div>

      {/* Chat Messages Area */}
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50 via-gray-50 to-white relative"
      >
        {conversation.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center px-4 md:px-5 py-8 md:py-10"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-6xl md:text-8xl lg:text-9xl mb-4 md:mb-6 drop-shadow-2xl"
            >
              🤖
            </motion.div>
            <h3 className="title-gradient text-slate-900 text-xl md:text-2xl lg:text-4xl font-extrabold mb-2 md:mb-3">
              Hi! I'm Mani's AI Assistant
            </h3>
            <p className="text-slate-600 text-sm md:text-base lg:text-lg mb-6 md:mb-10 max-w-xs md:max-w-md px-2">
              Ask me anything about Mani's projects, skills, or professional
              experience
            </p>

            {/* Suggested Questions */}
            <div className="w-full max-w-xl">
              <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4">
                Try Asking:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {suggestedQuestions.map((question, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="btn-gradient px-4 py-3 md:px-5 md:py-3.5 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-3 md:p-5 lg:p-8 flex flex-col gap-3 md:gap-5">
            {conversation.map((message, index) => (
              <ChatBox key={index} index={index} {...message} />
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 md:gap-3"
              >
                <div className="ai-avatar w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg shadow-lg">
                  🤖
                </div>
                <div className="flex gap-1 md:gap-1.5 px-3 py-2 md:px-5 md:py-4 bg-white rounded-xl md:rounded-2xl rounded-bl-sm shadow-lg border border-blue-100">
                  <span className="loading-dot-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-bounce"></span>
                  <span className="loading-dot-2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="loading-dot-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {conversation.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 md:px-5 py-2 md:py-3 flex justify-center bg-slate-50 border-t border-gray-200"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={regenerateLastResponse}
            className="regenerate-btn flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white rounded-full text-xs md:text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <FiRefreshCw size={14} className="md:hidden" />
            <FiRefreshCw size={16} className="hidden md:block" />
            <span className="hidden sm:inline">Regenerate Response</span>
            <span className="sm:hidden">Regenerate</span>
          </motion.button>
        </motion.div>
      )}

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="px-3 md:px-5 py-3 md:py-5 bg-white border-t border-gray-200 shadow-2xl"
      >
        <div className="flex gap-2 md:gap-3 mb-1.5 md:mb-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything about Mani..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                fetchQueryResponse();
              }
            }}
            disabled={isLoading}
            className="flex-1 px-3 py-3 md:px-5 md:py-4 text-sm md:text-base border-2 border-gray-300 rounded-3xl outline-none transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchQueryResponse()}
            disabled={isLoading || !input.trim()}
            className="send-btn-gradient w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <AiOutlineSend size={24} />
            )}
          </motion.button>
        </div>
        <p className="text-center text-[10px] md:text-xs text-slate-500 font-medium">
          Press{" "}
          <kbd className="px-1.5 py-0.5 md:px-2 md:py-1 bg-slate-100 rounded border md:rounded-md border-slate-300 font-mono text-[9px] md:text-xs shadow-sm">
            Enter
          </kbd>{" "}
          to send
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Main;
