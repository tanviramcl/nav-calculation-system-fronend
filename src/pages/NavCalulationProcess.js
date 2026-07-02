import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataGrid } from "@mui/x-data-grid";
import { getNavProcessFunds } from "../api/navCalApi";

const NavCalulationProcess = () => {
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
const [liabilityOpen, setLiabilityOpen] = useState(false);
const [selectedFund, setSelectedFund] = useState(null);

  const [navDate, setNavDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const [fundType, setFundType] = useState("");

  useEffect(() => {
    loadFunds();
  }, []);

  useEffect(() => {
    if (fundType === "") {
      setRows(allRows);
    } else {
      setRows(allRows.filter((item) => item.F_TYPE === fundType));
    }
  }, [fundType, allRows]);

  const loadFunds = async () => {
    try {
      setLoading(true);

      const funds = await getNavProcessFunds();

      const formattedRows = funds.map((item) => ({
        id: item.f_CD,
        F_CD: item.f_CD,
        F_NAME: item.f_NAME,
        F_TYPE: item.f_TYPE,
        LAST_NAVNO: item.lasT_NAVNO,
        LAST_NAVDATE: item.lasT_NAVDATE,
        NAVNO: item.navno,
      }));

      setAllRows(formattedRows);
      setRows(formattedRows);
    } catch (error) {
      console.error("Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "F_CD",
      headerName: "Fund Code",
      width: 120,
    },
    {
      field: "F_NAME",
      headerName: "Fund Name",
      flex: 1,
      minWidth: 280,
    },
    {
      field: "F_TYPE",
      headerName: "Fund Type",
      width: 150,
    },
    {
      field: "LAST_NAVNO",
      headerName: "Last NAV No",
      width: 140,
    },
    {
      field: "LAST_NAVDATE",
      headerName: "Last NAV Date",
      width: 180,
      valueGetter: (value) => {
        if (!value) return "";
        return new Date(value).toLocaleDateString("en-GB");
      },
    },
    {
      field: "NAVNO",
      headerName: "Next NAV No",
      width: 140,
    },{
  field: "TOTAL_ASSET",
  headerName: "Total Asset",
  width: 130,
  sortable: false,
  align: "center",
  headerAlign: "center",
  renderCell: (params) => (
    <Tooltip title="View Total Asset">
      <IconButton
        color="primary"
        onClick={() => handleOpenAsset(params.row)}
      >
        <VisibilityIcon />
      </IconButton>
    </Tooltip>
  ),
},
{
  field: "TOTAL_LIABILITY",
  headerName: "Total Liabilities",
  width: 150,
  sortable: false,
  align: "center",
  headerAlign: "center",
  renderCell: (params) => (
    <Tooltip title="View Total Liabilities">
      <IconButton
        color="error"
        onClick={() => handleOpenLiability(params.row)}
      >
        <VisibilityIcon />
      </IconButton>
    </Tooltip>
  ),
},
    
  ];

  const handleOpenAsset = (row) => {
  setSelectedFund(row);
  setAssetOpen(true);
};

const handleOpenLiability = (row) => {
  setSelectedFund(row);
  setLiabilityOpen(true);
};

const handleCloseAsset = () => {
  setAssetOpen(false);
};

const handleCloseLiability = () => {
  setLiabilityOpen(false);
};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        NAV Calculation Process
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="NAV Date"
            type="date"
            value={navDate}
            onChange={(e) => setNavDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Fund Type</InputLabel>
            <Select
              value={fundType}
              label="Fund Type"
              onChange={(e) => setFundType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="OPEN END">OPEN END</MenuItem>
              <MenuItem value="CLOSE END">CLOSE END</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: {
                  page: 0,
                  pageSize: 10,
                },
              },
            }}
          />
        </Box>
      </Paper>
      <Dialog
  open={assetOpen}
  onClose={handleCloseAsset}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Total Asset</DialogTitle>

  <DialogContent dividers>
    <Typography sx={{ mb: 2 }}>
      <strong>Fund Code:</strong> {selectedFund?.F_CD}
    </Typography>

    <Typography sx={{ mb: 2 }}>
      <strong>Fund Name:</strong> {selectedFund?.F_NAME}
    </Typography>

    <Typography>
      <strong>NAV Date:</strong> {navDate}
    </Typography>

    {/* এখানে পরবর্তীতে Asset Grid বা API Data দেখাবেন */}
  </DialogContent>

  <DialogActions>
    <Button onClick={handleCloseAsset}>Close</Button>
  </DialogActions>
</Dialog>
<Dialog
  open={liabilityOpen}
  onClose={handleCloseLiability}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Total Liabilities</DialogTitle>

  <DialogContent dividers>
    <Typography sx={{ mb: 2 }}>
      <strong>Fund Code:</strong> {selectedFund?.F_CD}
    </Typography>

    <Typography sx={{ mb: 2 }}>
      <strong>Fund Name:</strong> {selectedFund?.F_NAME}
    </Typography>

    <Typography>
      <strong>NAV Date:</strong> {navDate}
    </Typography>

  
  </DialogContent>

  <DialogActions>
    <Button onClick={handleCloseLiability}>Close</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default NavCalulationProcess;