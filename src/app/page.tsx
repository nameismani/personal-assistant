import { Box, Typography } from "@mui/material";
import Main from "./components/Main";

export default function Home() {
  return (
    <Box
      component={"div"}
      className="w-full h-screen flex-col justify-center items-center"
    >
      {/* {" "}
      <Typography
        variant="body2"
        component="h1"
        sx={{ mt: 4, mb: 2 }}
        className="text-center"
      >
        Welcome to Mani's Personal Assistant
      </Typography> */}
      <Box className="w-full md:w-1/2 m-auto h-[80%]">
        <Main />
      </Box>
    </Box>
  );
}
