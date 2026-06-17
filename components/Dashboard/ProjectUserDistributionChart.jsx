import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import Chart from "react-apexcharts";
import { getProjectWiseUserCountAPI } from "../../api/userApi";

const ProjectUserDistributionChart = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], options: {} });
  const [numProjects, setNumProjects] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getProjectWiseUserCountAPI();

        const projectNames = data.map(d => d.projectName);
        const userCounts = data.map(d => d.userCount);
        const projectCount = projectNames.length;

        setNumProjects(projectCount);

        setChartData({
          series: [{ name: "Users", data: userCounts }],
          options: {
            chart: {
              type: "bar",
              toolbar: { show: false },
              foreColor: theme.palette.text.primary,
              zoom: { enabled: false },
              width: "100%",
              height: isMobile ? 400 : 450
            },
            plotOptions: {
              bar: {
                horizontal: false,
                borderRadius: 4,
                columnWidth: "55%",
                distributed: false
              },
            },
            dataLabels: { 
              enabled: true, 
              style: { fontSize: isMobile ? "10px" : "12px" },
              offsetY: -20
            },
            xaxis: {
              categories: projectNames,
              labels: {
                rotate: isMobile ? -60 : -45,
                style: { 
                  fontSize: isMobile ? "9px" : "11px",
                  fontWeight: 500
                },
                trim: true,
                maxHeight: 120
              },
              title: { 
                text: "Projects", 
                style: { fontSize: "12px", fontWeight: 600 } 
              },
              axisBorder: { show: false },
              axisTicks: { show: false }
            },
            yaxis: {
              title: { 
                text: "Number of Users", 
                style: { fontSize: "12px", fontWeight: 600 } 
              },
              min: 0,
              forceNiceScale: true,
              labels: {
                style: { fontSize: "11px" }
              }
            },
            tooltip: { 
              y: { formatter: val => `${val} users` },
              x: { formatter: projectName => projectName }
            },
            grid: { 
              borderColor: theme.palette.divider,
              strokeDashArray: 3,
              xaxis: { lines: { show: true } },
              yaxis: { lines: { show: false } }
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
                xaxis: { labels: { rotate: -60 } }
              }
            }]
          },
        });
      } catch (err) {
        console.error("Failed to fetch project wise user count", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [theme, isMobile]);

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Typography variant="subtitle1" gutterBottom>
        Project-wise User Distribution ({numProjects} projects)
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : chartData.series.length > 0 ? (
        <Box sx={{ 
          width: "100%", 
          height: isMobile ? 400 : 450,
          position: "relative"
        }}>
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={isMobile ? "400px" : "450px"}
            width="100%"
          />
        </Box>
      ) : (
        <Typography align="center" sx={{ mt: 3 }}>
          No project data found
        </Typography>
      )}
    </Paper>
  );
};

export default ProjectUserDistributionChart;
