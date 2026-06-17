import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ExpensePayableUpdateModal = ({
  open,
  onClose,
  selectedRows,
  onUpdate,
}) => {
  const columns =
    selectedRows.length > 0
      ? Object.keys(selectedRows[0]).map((key) => ({
          field: key,
          headerName: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          flex: 1,
          minWidth: 150,
        }))
      : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle
        sx={{
          backgroundColor: "#6114a8",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        Selected Fund Information
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography sx={{ mb: 2 }}>
          Total Selected Funds: {selectedRows.length}
        </Typography>

        <Box sx={{ height: 450, width: "100%" }}>
          <DataGrid
            rows={selectedRows}
            columns={columns}
            getRowId={(row) => row.fundCode}
            hideFooter
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={onUpdate}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpensePayableUpdateModal;