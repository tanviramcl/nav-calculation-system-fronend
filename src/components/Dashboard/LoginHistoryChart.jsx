import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { getLoginHistory } from "../../api/userApi";

const LoginHistoryChart = ({ userId, projectId }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], options: {} });
  const [numDays, setNumDays] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getLoginHistory(userId, projectId);

        const dayMap = {};
        data.filter(d => d.logoutTime).forEach(d => {
          const day = dayjs(d.loginTime).format("YYYY-MM-DD");
          const duration = dayjs(d.logoutTime).diff(dayjs(d.loginTime), "minute");
          dayMap[day] = (dayMap[day] || 0) + duration;
        });

        const categories = Object.keys(dayMap).sort();
        const durations = categories.map(day => dayMap[day]);
        const dayCount = categories.length;

        setNumDays(dayCount);

        setChartData({
          series: [{ name: "Total Duration (minutes)", data: durations }],
          options: {
            chart: {
              type: "bar",
              toolbar: { show: false },
              foreColor: theme.palette.text.primary,
              zoom: { enabled: false },
              width: "100%",
              height: isMobile ? 380 : 420
            },
            plotOptions: {
              bar: {
                horizontal: false,
                borderRadius: 4,
                columnWidth: "60%",
                distributed: false
              },
            },
            dataLabels: { 
              enabled: true, 
              style: { 
                fontSize: isMobile ? "10px" : "11px",
                fontWeight: 500
              },
              offsetY: -25,
              formatter: val => val > 0 ? `${Math.round(val)}m` : ''
            },
            xaxis: {
              categories,
              labels: {
                rotate: isMobile ? -45 : -30,
                style: { 
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 500
                },
                trim: true,
                maxHeight: 70,
                formatter: (val) => dayjs(val).format("MMM DD")
              },
              title: { 
                text: "Date", 
                style: { fontSize: "12px", fontWeight: 600 } 
              },
              axisBorder: { show: false },
              axisTicks: { show: false }
            },
            yaxis: {
              title: { 
                text: "Duration (minutes)", 
                style: { fontSize: "12px", fontWeight: 600 } 
              },
              min: 0,
              forceNiceScale: true,
              labels: {
                style: { fontSize: "11px" },
                formatter: (val) => `${Math.round(val)}`
              }
            },
            tooltip: { 
              y: { 
                formatter: val => `${Math.round(val)} minutes` 
              },
              x: { 
                formatter: val => dayjs(val).format("MMM DD, YYYY") 
              }
            },
            grid: { 
              borderColor: theme.palette.divider,
              strokeDashArray: 3,
              xaxis: { lines: { show: true } },
              yaxis: { lines: { show: false } },
              padding: { top: 10 }
            },
            colors: [theme.palette.primary.main],
            stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
            },
            legend: {
              show: false
            },
            responsive: [{
              breakpoint: 768,
              options: {
                chart: { height: 350 },
                plotOptions: { bar: { columnWidth: "75%" } },
                xaxis: { labels: { rotate: -45 } },
                dataLabels: { style: { fontSize: "9px" } }
              }
            }]
          },
        });
      } catch (err) {
        console.error("Failed to fetch login history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, projectId, isMobile, theme]);

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Typography variant="subtitle1" gutterBottom>
        User Login History ({numDays} days)
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : chartData.series.length > 0 ? (
        <Box sx={{ 
          width: "100%", 
          height: isMobile ? 380 : 420,
          position: "relative"
        }}>
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={isMobile ? "380px" : "420px"}
            width="100%"
          />
        </Box>
      ) : (
        <Typography align="center" sx={{ mt: 3 }}>
          No login data found
        </Typography>
      )}
    </Paper>
  );
};

export default LoginHistoryChart;
