import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
} from "@mui/material";

const AssignFundSection = ({
  funds,
  selectedFunds,
  setSelectedFunds,
  userDetails,
  selectedProject,
  assignedBy,
  assignUserFundAPI,
}) => {

  const [fundSearch, setfundSearch] = useState("");

  /* ================= FILTER ================= */

  const filteredFunds = useMemo(() => {
    return funds.filter(
      (fund) =>
        fund.fundName
          .toLowerCase()
          .includes(fundSearch.toLowerCase()) ||
        fund.fundCode
          .toLowerCase()
          .includes(fundSearch.toLowerCase())
    );
  }, [funds, fundSearch]);

  /* ================= CHECKBOX ================= */

  const fundlisthandleChange = (fundCode) => {
    setSelectedFunds((prev) =>
      prev.includes(fundCode)
        ? prev.filter((code) => code !== fundCode)
        : [...prev, fundCode]
    );
  };

  /* ================= SELECT ALL ================= */

  const allCodes = filteredFunds.map((f) => f.fundCode);

  const isAllSelected =
    allCodes.length > 0 &&
    allCodes.every((code) =>
      selectedFunds.includes(code)
    );

  const isIndeterminate =
    allCodes.some((code) =>
      selectedFunds.includes(code)
    ) && !isAllSelected;

  const handleFundsSelectAll = () => {
    if (isAllSelected) {
      setSelectedFunds((prev) =>
        prev.filter(
          (code) => !allCodes.includes(code)
        )
      );
    } else {
      setSelectedFunds((prev) => [
        ...new Set([...prev, ...allCodes]),
      ]);
    }
  };

  /* ================= SAVE ================= */

  const handleSaveFund = async () => {

    if (!selectedFunds.length) {
      alert("Please select at least one fund");
      return;
    }

    const payloadFunds = {
      userId: userDetails.userId,
      projectId: selectedProject,
      funds: selectedFunds,
      assignedBy,
    };

    try {

      const fundRes = await assignUserFundAPI(
        payloadFunds
      );

      console.log("Fund response:", fundRes);

      alert("Fund successfully ✅");

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.error ||
        "Save failed ❌"
      );
    }
  };

  return (
    <Box sx={{ mt: 3 }}>

      <Typography variant="h6">
        Select Funds
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search fund..."
        value={fundSearch}
        onChange={(e) =>
          setfundSearch(e.target.value)
        }
        sx={{ my: 1 }}
      />

      {/* SELECT ALL */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleFundsSelectAll}
          />
        }
        label="Select All"
      />

      {/* LIST */}
      <FormGroup>
        {filteredFunds.map((fund) => (
          <FormControlLabel
            key={fund.fundCode}
            control={
              <Checkbox
                checked={selectedFunds.includes(
                  fund.fundCode
                )}
                onChange={() =>
                  fundlisthandleChange(
                    fund.fundCode
                  )
                }
              />
            }
            label={`${fund.fundName} (${fund.fundCode})`}
          />
        ))}
      </FormGroup>

      {/* SELECTED */}
      <Typography variant="subtitle1">
        Selected Funds:
      </Typography>

      {selectedFunds.join(", ")}

      {/* BUTTON */}
      <Box
        sx={{
          my: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSaveFund}
        >
          Assign Funds
        </Button>
      </Box>

    </Box>
  );
};

export default AssignFundSection;