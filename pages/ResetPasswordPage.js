import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { updatePassword } from "../api/userApi";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumber && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword) {
      setError("Please enter your old password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password cannot be the same as the old password");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "New password must contain at least one number [0-9] and one special character (e.g., @, $, #)"
      );
      return;
    }

    try {
      await updatePassword({ userId, oldPassword, newPassword });
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Password update failed");
    }
  };

  if (!userId) return <Typography>Error: No user data found.</Typography>;

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontSize: { xs: "1rem", sm: "1.1rem" } }}
        >
          Reset Password
        </Typography>

        <Box>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Old Password"
              type="password"
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.2 }}
            >
              Update Password
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
