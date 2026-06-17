import React from "react";
import { Paper, Typography } from "@mui/material";

const StatCard = ({ title, value, color }) => (
  <Paper
    sx={{
      flex: 1,
      p: 2.5,
      textAlign: "center",
      borderLeft: `6px solid ${color}`,
    }}
  >
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
      {value}
    </Typography>
  </Paper>
);

const StatCards = ({ stats, loading, theme }) => {
  if (loading) {
    return (
      <Paper sx={{ flex: 1, p: 3, textAlign: "center" }}>
        Loading stats...
      </Paper>
    );
  }

  if (!stats) return <Typography>No stats available</Typography>;

  return (
    <>
      <StatCard title="Total Users" value={stats.totalUsers} color={theme.palette.primary.main} />
      <StatCard title="Active Users" value={stats.activeUsers} color={theme.palette.success.main} />
      <StatCard title="Inactive Users" value={stats.inactiveUsers} color={theme.palette.error.main} />
    </>
  );
};

export default StatCards;
