import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Chart from "react-apexcharts";
import { getLatestPriceRefixAPI } from "../../api/navCalApi";

const LatestPriceRefixChart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)");

  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });
  const [fundCount, setFundCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await getLatestPriceRefixAPI();
        console.log("API response (raw):", data);

        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];

        // Only keep rows that have a fund code and at least one valid price
        const cleaned = list
          .map((item) => ({
            fundCd: item?.funD_CD ?? null,
            salePrice:
              item?.refiX_SL_PR != null ? Number(item.refiX_SL_PR) : null,
            repPrice:
              item?.refiX_REP_PR != null ? Number(item.refiX_REP_PR) : null,
          }))
          .filter(
            (item) =>
              item.fundCd != null &&
              (!isNaN(item.salePrice) || !isNaN(item.repPrice))
          );

        if (cleaned.length === 0) {
          setFundCount(0);
          setChartData({ series: [], options: {} });
          return;
        }

        const fundCodes = cleaned.map((item) => item.fundCd);
        const salePrices = cleaned.map((item) => item.salePrice ?? 0);
        const repPrices = cleaned.map((item) => item.repPrice ?? 0);

        setFundCount(fundCodes.length);

        setChartData({
          series: [
            { name: "Sale Price", data: salePrices },
            { name: "Repurchase Price", data: repPrices },
          ],
          options: {
            chart: {
              type: "bar",
              toolbar: { show: false },
              zoom: { enabled: false },
              foreColor: theme.palette.text.primary,
            },
            plotOptions: {
              bar: {
                horizontal: false,
                borderRadius: 5,
                columnWidth: "55%",
              },
            },
            colors: [theme.palette.success.main, theme.palette.info.main],
            dataLabels: {
              enabled: true,
              formatter: (val) => Number(val).toFixed(2),
              offsetY: -18,
            },
            xaxis: {
              categories: fundCodes,
              title: { text: "Fund" },
              labels: {
                rotate: isMobile ? -60 : -45,
                trim: true,
                style: { fontSize: isMobile ? "9px" : "11px" },
              },
            },
            yaxis: {
              title: { text: "Price" },
              labels: {
                formatter: (val) => Number(val).toFixed(2),
              },
            },
            tooltip: {
              y: {
                formatter: (val) => `${Number(val).toFixed(2)}`,
              },
            },
            stroke: {
              show: true,
              width: 2,
              colors: ["transparent"],
            },
            grid: {
              borderColor: theme.palette.divider,
              strokeDashArray: 3,
            },
            legend: {
              show: true,
              position: "top",
            },
            responsive: [
              {
                breakpoint: 768,
                options: {
                  chart: { height: 350 },
                },
              },
            ],
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [theme, isMobile]);

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Typography variant="subtitle1" gutterBottom>
        Latest Price Refix ({fundCount} Funds)
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : chartData.series.length > 0 ? (
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={isMobile ? 400 : 450}
        />
      ) : (
        <Typography align="center" sx={{ mt: 3 }}>
          No Data Found
        </Typography>
      )}
    </Paper>
  );
};

export default LatestPriceRefixChart;
