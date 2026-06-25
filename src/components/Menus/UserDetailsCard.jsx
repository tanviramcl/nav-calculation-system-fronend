import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import { getUserImage } from "../../api/userApi";

const UserDetailsCard = ({ user }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;

    const loadUserImage = async () => {
      try {
        setLoadingImage(true);
        const res = await getUserImage(user.userId);

        if (res instanceof Blob) {
          setImagePreview(URL.createObjectURL(res));
        } else {
          setImagePreview(res || null);
        }
      } catch (err) {
        console.error("Failed to load user image", err);
        setImagePreview(null);
      } finally {
        setLoadingImage(false);
      }
    };

    loadUserImage();
  }, [user]);

  if (!user) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        User Details
      </Typography>

      <Grid container spacing={3}>
        {/* ================= LEFT: IMAGE ================= */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          {loadingImage ? (
            <CircularProgress />
          ) : (
            <Avatar
              src={imagePreview}
              sx={{ width: 120, height: 120 }}
            >
              {!imagePreview && user.userName?.charAt(0)}
            </Avatar>
          )}
        </Grid>

{/* ================= RIGHT: DETAILS ================= */}
<Grid item xs={12} md={9}>
  {/* Row 1: User ID + User Name + Status (3 columns desktop) */}
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={12} sm={4}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
        <Typography>{user.userId}</Typography>
      </Box>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">User Name</Typography>
        <Typography>{user.userName}</Typography>
      </Box>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
        <Chip
          label={user.userStatus === "V" ? "Active" : "Inactive"}
          color={user.userStatus === "V" ? "success" : "error"}
          size="small"
          sx={{ width: "fit-content" }}
        />
      </Box>
    </Grid>
  </Grid>

  {/* Row 2: Employee ID + Designation */}
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
        <Typography>{user.empId || "-"}</Typography>
      </Box>
    </Grid>
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">Designation</Typography>
        <Typography>{user.designation || "-"}</Typography>
      </Box>
    </Grid>
  </Grid>

  {/* Row 3: Email + Phone Number */}
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
        <Typography>{user.userEmail || "-"}</Typography>
      </Box>
    </Grid>
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
        <Typography>{user.phoneNumber || "-"}</Typography>
      </Box>
    </Grid>
  </Grid>
</Grid>


      </Grid>
    </Paper>
  );
};

export default UserDetailsCard;
