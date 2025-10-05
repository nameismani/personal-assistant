"use client";
import React, { useState, useRef, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { fetchAIResponse } from "../actions/llm";
import { AiOutlineSend } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
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

  const suggestedQuestions = [
    "What are Mani's top 3 projects?",
    "What technologies does Mani know?",
    "Tell me about Mani's experience",
    "What are the demo credentials?",
  ];

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
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
      className="w-full max-w-full md:max-w-4xl h-screen md:h-[90vh] flex flex-col bg-white md:rounded-3xl shadow-none md:shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 md:rounded-t-3xl shadow-lg sticky top-0 z-10"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-lg flex items-center justify-center cursor-pointer border-2 border-white/40 flex-shrink-0"
          >
            <span className="text-xl font-bold text-white">M</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-lg font-bold leading-tight truncate">
              Mani's Personal Assistant
            </h1>
            <p className="text-white/95 text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online • Ready to help
            </p>
          </div>
        </div>
        {conversation.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearConversation}
            className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors flex-shrink-0"
            title="Clear chat"
          >
            <MdClear size={20} />
          </motion.button>
        )}
      </motion.div>

      {/* Chat Messages Area */}
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-gray-50 to-white relative"
      >
        <AnimatePresence mode="wait">
          {conversation.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col items-center justify-center text-center px-5 py-10"
            >
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-7xl md:text-8xl mb-5 drop-shadow-lg"
              >
                👋
              </motion.div>
              <h3 className="text-slate-800 text-2xl md:text-3xl font-bold mb-2">
                Hi! I'm Mani's AI Assistant
              </h3>
              <p className="text-slate-600 text-base md:text-lg mb-8 max-w-xs md:max-w-md">
                Ask me anything about Mani's projects, skills, or experience
              </p>

              {/* Suggested Questions */}
              <div className="w-full max-w-lg">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-full text-slate-700 text-sm font-medium hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm hover:shadow-md"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-5 md:p-6 flex flex-col gap-4 min-h-full">
              {conversation.map((message, index) => (
                <ChatBox key={index} index={index} {...message} />
              ))}
            </div>
          )}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 px-5 pb-5"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-base shadow-lg flex-shrink-0">
              🤖
            </div>
            <div className="flex gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-sm shadow-md border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {conversation.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 py-2 flex justify-center bg-gray-50 border-t border-gray-200"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={regenerateLastResponse}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-slate-600 text-sm font-medium hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm hover:shadow-md"
          >
            <FiRefreshCw size={14} />
            Regenerate
          </motion.button>
        </motion.div>
      )}

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="px-5 py-4 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="flex gap-2.5 mb-2">
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
            className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-3xl outline-none transition-all bg-gray-50 text-slate-800 focus:border-teal-500 focus:bg-white focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => fetchQueryResponse()}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              <AiOutlineSend size={20} />
            )}
          </motion.button>
        </div>
        <p className="text-center text-xs text-slate-500">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to send
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Main;
