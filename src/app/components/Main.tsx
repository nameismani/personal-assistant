"use client";

import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { fetchAIResponse } from "../actions/llm";
interface query {
  query?: string;
  response?: string;
}
const Main = () => {
  const [query, setQuery] = useState<query>();
  const fetchQueryResponse = async () => {
    try {
      const response = await fetchAIResponse(query?.query || "");
      console.log(response, "sdfds");
      setQuery((prev) => ({
        ...(prev || {}),
        response,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Box className="text-center h-full flex flex-col justify-between items-center">
      <TextField
        label="Enter a query"
        variant="outlined"
        onChange={(event) => {
          setQuery((prev) => ({
            ...(prev || {}),
            query: event.target.value,
          }));
        }}
        className="w-[100%] md:w-[70%]"
      />
      {query?.response && <Box>{query.response}</Box>}
      <Button
        onClick={async () => {
          await fetchQueryResponse();
        }}
        size="medium"
      >
        Submit
      </Button>
    </Box>
  );
};

export default Main;
