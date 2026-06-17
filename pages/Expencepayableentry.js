import * as React from "react";
import dayjs from "dayjs";

import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import SearchIcon from "@mui/icons-material/Search";
import LoadingBackdrop from "../components/common/LoadingBackdrop";


import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { getmanagementFeeList } from "../api/expensePayableApi";
import { getExpenseTypeList } from "../api/expensePayableApi";

import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";

//////////////////////////modal/////////////////////////////////
import ExpensePayableUpdateModal from "../components/Expense/ExpensePayableUpdateModal";




const Expencepayableentry = () => {
  const [value, setValue] = React.useState(dayjs());
  const [days, setDays] = React.useState("1");
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [columns, setColumns] = useState([]);



  const [expenseTypes, setExpenseTypes] = React.useState([]);
  const [expenseType, setExpenseType] = React.useState("");
 
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  

  useEffect(() => {
    const loadExpenseTypes = async () => {
      try {
        const data = await getExpenseTypeList();

        console.log("Expense Types:", data);
        setExpenseTypes(data || []);

        if (data?.length > 0) {
          setExpenseType(data[0].expenseTypeId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadExpenseTypes();
  }, []);



  // for refresh data grid columns based on API response

  useEffect(() => {
    if (!expenseType || !value) return;

    handleFind();
  }, [expenseType, value, days]);


  const generateColumns = (data) => {

    console.log("Generating columns from data:", data);
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);

    return keys.map((key, index) => {
      const isLastColumn = index === keys.length - 1;

      return {
        field: key,

        headerName: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),

        flex: 1,
        minWidth: 150,

        // ONLY LAST COLUMN EDITABLE
        editable: isLastColumn,

        renderCell: (params) => {
          const isEditable = isLastColumn;

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>{params.value}</span>

              {isEditable && (
                <IconButton
                  size="small"
                  sx={{ color: "#1976d2" }}
                  onClick={() => {
                    params.api.startCellEditMode({
                      id: params.id,
                      field: key,
                    });
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        },

        valueFormatter: (params) => {
          const value = params;

          if (typeof value === "number") {
            return value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          return value ?? "";
        },
      };
    });
  };

  const handleProcessRowUpdateError = (error) => {
    console.error("Row update error:", error);
  };
  const processRowUpdate = (newRow) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.fundCode === newRow.fundCode ? newRow : row
      )
    );

    return newRow;
  };



  const handleFind = async () => {
    try {
      setLoading(true);

      const data = await getmanagementFeeList(
        expenseType,
        value.format("YYYY-MM-DD"),
        Number(days)
      );

      setRows(data || []);

      console.log("API Response Data:", data);

      if (data?.length > 0) {
        setColumns(generateColumns(data));
      }


    } catch (error) {
      console.error(error);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
   
    const selectedData = rows.filter((row) =>
    selectedIds.includes(row.fundCode)
  );

  if (!selectedData.length) {
    alert("Please select at least one row.");
    return;
  }

  setSelectedRows(selectedData);
  setOpenModal(true);

  };

  const handleUpdate = () => {
  const ids = selectedRows.map((x) => x.fundCode);

  alert(
    `Selected Fund IDs:\n\n${ids.join(", ")}`
  );

  console.log("Selected Rows:", selectedRows);
  alert(selectedRows);

  setOpenModal(false);
}

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          fontWeight: 600,
        }}
      >
        Expense Payable Calculation
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        > 

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="expense-type-label">
              Expense Type
            </InputLabel>

            <Select
              labelId="expense-type-label"
              value={expenseType}
              label="Expense Type"
              onChange={(e) => setExpenseType(e.target.value)}
            >
              {expenseTypes.map((item) => (
                <MenuItem
                  key={item.expenseTypeId}
                  value={item.expenseTypeId}
                >
                  {item.expenseTypeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="NAV Date"
              value={value}
              onChange={(newValue) => setValue(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Number of Days"
            size="small"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleFind}
            sx={{
              background: "linear-gradient(45deg, #6019d2, #6114a8)",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            Find
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
           
          >
            Save
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          height: 650,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.fundCode}
          checkboxSelection
          disableRowSelectionOnClick
          loading={loading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onRowSelectionModelChange={(newSelection) => {
            let idsArray;

            if (newSelection.type === "exclude") {
              // "select all" was used — selected = all rows except the excluded ones
              idsArray = rows
                .map((row) => row.fundCode)
                .filter((id) => !newSelection.ids.has(id));
            } else {
              idsArray = Array.from(newSelection.ids);
            }

            setSelectedIds(idsArray);
            console.log(idsArray);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          slots={{
            toolbar: GridToolbar,
          }}
        />
      </Paper>
      {/* Loader */}
      <LoadingBackdrop
        open={loading}


      />
            <ExpensePayableUpdateModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        selectedRows={selectedRows}
        onUpdate={handleUpdate}
      />
    </Box>
  );
};

export default Expencepayableentry;