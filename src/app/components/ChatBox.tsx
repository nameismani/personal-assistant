"use client";
import React, { memo, useState, useEffect } from "react";
import { Message } from "./Main";
import { motion } from "framer-motion";
import { FiCopy, FiCheck } from "react-icons/fi";

interface ChatBoxProps extends Message {
  index: number;
}

const ChatBox = ({ type, value, index, timestamp }: ChatBoxProps) => {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(type === "ai");

  // Typing animation for AI messages
  useEffect(() => {
    if (type === "ai" && value) {
      setDisplayedText("");
      setIsTyping(true);
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= value.length) {
          setDisplayedText(value.substring(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 10); // Speed: 10ms per character (adjust for faster/slower)

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText(value);
      setIsTyping(false);
    }
  }, [value, type]);

  const copyToClipboard = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = value;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.05, 0.3),
        ease: "easeOut",
      }}
      className={`flex w-full ${
        type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-2.5 max-w-[85%] md:max-w-[75%] items-end ${
          type === "user" ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: type === "user" ? 180 : -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg flex-shrink-0 ${
            type === "ai"
              ? "bg-gradient-to-br from-teal-600 to-cyan-600"
              : "bg-gradient-to-br from-rose-500 to-pink-500"
          }`}
        >
          {type === "ai" ? "🤖" : "👤"}
        </motion.div>

        {/* Message Bubble */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`px-4 py-3 rounded-2xl break-words overflow-hidden ${
              type === "user"
                ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-sm shadow-lg"
                : "bg-white text-slate-800 border border-gray-200 rounded-bl-sm shadow-md"
            }`}
          >
            <div
              className="message-content leading-relaxed text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: displayedText }}
            />
            {isTyping && (
              <span className="inline-block w-1 h-4 ml-0.5 bg-teal-600 animate-pulse"></span>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-1 px-1">
            <span className="text-[11px] text-slate-400 font-medium">
              {formatTime(timestamp)}
            </span>
            {type === "ai" && !isTyping && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyToClipboard}
                className="p-1 text-slate-400 hover:bg-gray-100 hover:text-teal-600 rounded transition-colors"
                title="Copy message"
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ChatBox);
