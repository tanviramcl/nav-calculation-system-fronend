import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";


import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../api/userApi";
import { toast } from "react-toastify";
import Logo from "../assets/icb_logo.svg";

const LoginPage = () => {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginUser(userID, password);
      login(data.token, data.userId);

      if (!data.passwordUpToDate) {
        navigate("/reset-password", {
          state: { userId: data.userId, oldPassword: password },
        });
        return;
      }

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "#0b1220",
      }}
    >
      {/* ================= STOCK MARKET BACKGROUND ================= */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Grid */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.2,
          }}
        />

        {/* Animated stock line */}
        <svg
          viewBox="0 0 1440 320"
          style={{
            position: "absolute",
            bottom: 0,
            width: "200%",
            opacity: 0.25,
            animation: "moveLine 8s linear infinite",
          }}
        >
          <path
            fill="none"
            stroke="#7c3aed"
            strokeWidth="3"
            d="M0,200 L100,180 L200,220 L300,160 L400,190 L500,120 L600,140 L700,90 L800,110 L900,70 L1000,120 L1100,80 L1200,130 L1300,100 L1400,150"
          />
        </svg>

        {/* Floating bars */}
        <Box
          sx={{
            position: "absolute",
            bottom: 80,
            left: 100,
            width: 8,
            height: 120,
            background: "rgba(124,58,237,0.5)",
            animation: "floatBar 3s infinite ease-in-out",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 120,
            left: 160,
            width: 8,
            height: 80,
            background: "rgba(103,45,136,0.5)",
            animation: "floatBar 4s infinite ease-in-out",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 60,
            left: 220,
            width: 8,
            height: 160,
            background: "rgba(124,58,237,0.4)",
            animation: "floatBar 3.5s infinite ease-in-out",
          }}
        />

        {/* Animations */}
        <style>
          {`
            @keyframes moveLine {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }

            @keyframes floatBar {
              0%,100% { transform: scaleY(1); opacity: 0.7; }
              50% { transform: scaleY(1.4); opacity: 1; }
            }
          `}
        </style>
      </Box>

      {/* ================= LOGIN CARD ================= */}
      <Container maxWidth="sm" sx={{ zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(18px)",
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 3 }}>
            <img src={Logo} alt="ICB Logo" style={{ height: 55 }} />
          </Box>

         
          {/* Security Badge */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mb: 3,
              p: 1,
              borderRadius: 2,
              background: "rgba(124,58,237,0.08)",
            }}
          >

            <Typography sx={{ fontSize: 12, color: "#7c3aed" }}>
              Daily NAV Calulation System
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="User ID"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              />

              <Link href="#" sx={{ color: "#7c3aed" }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg,#672d88,#7c3aed)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;