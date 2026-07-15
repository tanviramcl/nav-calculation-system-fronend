import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, useMediaQuery, useTheme, CircularProgress, Paper } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import StatCards from "../components/Dashboard/StatCards";
import LoginHistoryChart from "../components/Dashboard/LoginHistoryChart";
import LatestPriceRefixChart from "../components/Dashboard/LatestPriceRefixChart";
import { getDashboardStatsAPI } from "../api/userApi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { userId } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)");
  const projectId = 14;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await getDashboardStatsAPI();
        setStats(res);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard Home
      </Typography>

      {/* STAT CARDS */}
      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2, mb: 3 }}>
        <StatCards stats={stats} loading={loadingStats} theme={theme} />
      </Box>

      {/* CHARTS */}
        <Box sx={{ p: 2, mb: 2, width: "100%" }}>
            <LatestPriceRefixChart />
        </Box>

        <Box sx={{ p: 2, mb: 2, width: "100%" }}>
            <LoginHistoryChart userId={userId} projectId={projectId} />
        </Box>




    </Box>
  );
};

export default Dashboard;