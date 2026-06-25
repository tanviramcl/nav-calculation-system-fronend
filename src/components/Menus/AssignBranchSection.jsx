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

const AssignBranchSection = ({
  branches,
  selectedBranches,
  setSelectedBranches,
  userDetails,
  selectedProject,
  assignedBy,
  assignUserBranchAPI,
}) => {

  const [search, setSearch] = useState("");

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    return branches.filter(
      (b) =>
        b.branchName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        b.branchCode
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [branches, search]);

  /* ================= CHECKBOX ================= */

  const branchListhandleChange = (code) => {
    setSelectedBranches((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  /* ================= SELECT ALL ================= */

  const allbranchCodes = filteredData.map(
    (b) => b.branchCode
  );

  const isbranchAllSelected =
    allbranchCodes.length > 0 &&
    allbranchCodes.every((code) =>
      selectedBranches.includes(code)
    );

  const isbranchIndeterminate =
    allbranchCodes.some((code) =>
      selectedBranches.includes(code)
    ) && !isbranchAllSelected;

  const handlebranchSelectAll = () => {
    if (isbranchAllSelected) {
      setSelectedBranches((prev) =>
        prev.filter(
          (code) =>
            !allbranchCodes.includes(code)
        )
      );
    } else {
      setSelectedBranches((prev) => [
        ...new Set([
          ...prev,
          ...allbranchCodes,
        ]),
      ]);
    }
  };

  /* ================= SAVE ================= */

  const handleSaveVBranch = async () => {

    if (!selectedBranches.length) {
      alert("Please select at least one branch");
      return;
    }

    const payloadBranch = {
      userId: userDetails.userId,
      projectId: selectedProject,
      branches: selectedBranches,
      assignedBy,
    };

    try {

      const branchRes =
        await assignUserBranchAPI(
          payloadBranch
        );

      console.log(
        "Branch response:",
        branchRes
      );

      alert(
        "Branch assigned successfully ✅"
      );

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
        Select Branch
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search branch..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        sx={{ my: 1 }}
      />

      {/* SELECT ALL */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isbranchAllSelected}
            indeterminate={
              isbranchIndeterminate
            }
            onChange={
              handlebranchSelectAll
            }
          />
        }
        label="Select All"
      />

      {/* LIST */}
      <FormGroup>
        {filteredData.map((branch) => (
          <FormControlLabel
            key={branch.branchCode}
            control={
              <Checkbox
                checked={selectedBranches.includes(
                  branch.branchCode
                )}
                onChange={() =>
                  branchListhandleChange(
                    branch.branchCode
                  )
                }
              />
            }
            label={`${branch.branchName} (${branch.branchCode})`}
          />
        ))}
      </FormGroup>

      {/* SELECTED */}
      <Box mt={2}>
        <Typography variant="subtitle1">
          Selected:
        </Typography>

        {selectedBranches.join(", ")}
      </Box>

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
          onClick={handleSaveVBranch}
        >
          Assign Branch
        </Button>
      </Box>

    </Box>
  );
};

export default AssignBranchSection;