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
      }, 5);

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
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={`flex w-full ${
        type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-2 md:gap-3 max-w-[92%] md:max-w-[85%] lg:max-w-[80%] items-end ${
          type === "user" ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: type === "user" ? 180 : -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className={`${
            type === "ai" ? "ai-avatar" : "user-avatar"
          } w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg shadow-xl flex-shrink-0`}
        >
          {type === "ai" ? "🤖" : "👤"}
        </motion.div>

        {/* Message Bubble */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`px-3 py-2.5 md:px-5 md:py-4 rounded-2xl md:rounded-3xl break-words overflow-hidden ${
              type === "user"
                ? "user-message-bubble text-white rounded-br-sm md:rounded-br-md shadow-xl"
                : "bg-white text-slate-800 border-2 border-blue-100 rounded-bl-sm md:rounded-bl-md shadow-lg"
            }`}
          >
            <div
              className="message-content leading-relaxed text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: displayedText }}
            />
            {isTyping && (
              <span className="inline-block w-0.5 h-4 md:h-5 ml-0.5 md:ml-1 bg-blue-600 animate-pulse"></span>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-1 md:mt-2 px-1 md:px-2">
            <span className="text-[10px] md:text-xs text-slate-500 font-medium">
              {formatTime(timestamp)}
            </span>
            {type === "ai" && !isTyping && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyToClipboard}
                className="p-1 md:p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-md md:rounded-lg transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <FiCheck size={13} className="text-green-500 md:hidden" />
                ) : (
                  <FiCopy size={13} className="md:hidden" />
                )}
                {copied ? (
                  <FiCheck
                    size={15}
                    className="text-green-500 hidden md:block"
                  />
                ) : (
                  <FiCopy size={15} className="hidden md:block" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ChatBox);
