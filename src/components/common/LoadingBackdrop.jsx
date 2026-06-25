import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const LoadingBackdrop = ({
open = false,
message = "Loading Data..."
}) => {
return (
<Backdrop
open={open}
sx={{
color: "#fff",
zIndex: (theme) => theme.zIndex.drawer + 999,
flexDirection: "column",
}}
> <CircularProgress color="inherit" />

  <Box sx={{ mt: 2 }}>
    {message}
  </Box>
</Backdrop>

);
};

export default LoadingBackdrop;
