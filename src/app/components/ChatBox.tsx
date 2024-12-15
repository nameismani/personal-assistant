import React, { memo } from "react";
import { Message } from "./Main";
import { Box } from "@mui/material";

const ChatBox = ({ type, value }: Message) => {
  return (
    <Box className={`chat-message ${type === "user" ? "user" : "ai"}`}>
      {value}
    </Box>
  );
};

export default memo(ChatBox);
