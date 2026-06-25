import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel, Select,
  MenuItem, CircularProgress,
  Stack, Button,
  Alert, Typography, Checkbox,
  FormControlLabel, FormGroup, TextField
} from "@mui/material";

import { userDropdownAPI } from "../api/userApi";
import { getUserDetailsAPI } from "../api/userApi";
import { getAllProjectsAPI } from "../api/userApi";
import { checkUserProjectValidAPI } from "../api/userApi";
import UserDetailsCard from "../components/Menus/UserDetailsCard";
import { assignUserToProjectAPI } from "../api/userApi";
import { useAuth } from "../contexts/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { fundsDropdownAPI } from "../api/userApi";
import { revokeUserFromProjectAPI } from "../api/userApi";
import { getUserMenusAPI } from "../api/userApi";
import { baranchDropdownAPI } from "../api/userApi";
import UserMenuTree from "../components/Menus/UserMenuTree";
import {
  assignUserFundAPI, assignUserBranchAPI, getUserFundsAPI,
  getUserBranchesAPI
} from "../api/userApi";









const TanvirPage = () => {

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectAccess, setProjectAccess] = useState(null);
  const [loadingProjectCheck, setLoadingProjectCheck] = useState(false);
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { userId: assignedBy } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirm",
    confirmColor: "primary",
  });
  const openConfirm = (config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  }
  const closeConfirm = () => {
    setConfirmOpen(false);
  };

  const [funds, setFunds] = useState([]);

  const [selectedFunds, setSelectedFunds] = useState([]);

  const [tradeUnitporoject, settradeUnitporojectAccess] = useState(null);
  const [branches, setBranches] = useState([]);


  const [selectedBranches, setSelectedBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [fundSearch, setfundSearch] = useState("");








  useEffect(() => {
    userDropdownAPI().then((data) => {
      // console.log('data', data);
      setUsers(data);
    });
  }, []);


  useEffect(() => {

    if (userDetails) {
      getAllProjectsAPI().then(setProjects);

      // console.log("Projects:", projects);

    }
    else {
      setProjects([]);

    }

  }, [userDetails]);

  /* =================  FUND list ================= */

  useEffect(() => {

    console.log(projectAccess);

    if (projectAccess) {
      fundsDropdownAPI().then(setFunds);
      baranchDropdownAPI().then(setBranches);

      console.log("Funds:", funds);
      console.log("Branches:", branches);
    }
    else {
      setFunds([]);

    }

  }, [projectAccess]);

  //.................loadind selected value of fund and branch for a user.................

  useEffect(() => {
    if (userDetails?.userId && selectedProject) {
      loadAssignedData();
    }
  }, [userDetails, selectedProject, projectAccess]);

  const loadAssignedData = async () => {
    try {
      // 🔹 Get assigned funds
      const assignedFunds = await getUserFundsAPI(
        userDetails.userId
      );

      // 🔹 Get assigned branches
      const assignedBranches = await getUserBranchesAPI(
        userDetails.userId
      );

      console.log("Assigned Funds:", assignedFunds);
      console.log("Assigned Branches:", assignedBranches);

      // ✅ Set selected funds
      setSelectedFunds(
        assignedFunds.map((x) => x.fundCode)
      );

      // ✅ Set selected branches
      setSelectedBranches(
        assignedBranches.map((x) => x.branchCode)
      );

    } catch (err) {
      console.error(err);
    }
  };



  const handleUserChange = async (userId) => {


    setSelectedUser(userId);
    setUserDetails(null);
    setSelectedProject("");
    setProjectAccess(null); 
    setSelectedFunds([]);
    setSelectedBranches([]);
    
    setMenus([]);

    setLoadingUser(true);

    console.log("Selected User ID:", userId);

    try {
      const data = await getUserDetailsAPI(userId); // ✅ OK

      // console.log("User Details:", data); // ✅ OK
      setUserDetails(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingUser(false);




    }

  }

  const handleprojectChange = async (projectId) => {

    const numericProjectId = Number(projectId);

    setSelectedProject(numericProjectId);
    setProjectAccess(null);
    setSelectedFunds([]);
    setSelectedBranches([]);
    setMenus([]);
    setLoadingProjectCheck(true);

    //alert("Hello! This is a simple alert."+numericProjectId);

    try {
      const res = await checkUserProjectValidAPI(
        userDetails.userId,
        numericProjectId
      );
      setProjectAccess(res);
    } finally {
      setLoadingProjectCheck(false);
    }


  }


  /* ================= LOAD MENUS ================= */
  useEffect(() => {
    if (
      projectAccess?.isValid &&
      userDetails?.userId &&
      selectedProject
    ) {
      const loadMenus = async () => {
        setLoadingMenus(true);
        try {
          const data = await getUserMenusAPI(
            userDetails.userId,
            selectedProject
          );
          setMenus(data || []);
        } finally {
          setLoadingMenus(false);
        }
      };

      loadMenus();
    }
  }, [projectAccess, userDetails, selectedProject]);

  /* ================= REVOKE PROJECT ================= */
  const handleRevokeProject = async () => {
    setAssigning(true);

    try {
      const res = await revokeUserFromProjectAPI(
        userDetails.userId,
        selectedProject
      );

      // Re-check project access
      const access = await checkUserProjectValidAPI(
        userDetails.userId,
        selectedProject
      );

      setProjectAccess({
        ...access,
        revokedMessage: res?.message || "Access revoked successfully",
      });

      // Clear menus immediately
      setMenus([]);
    } catch (err) {
      setProjectAccess({
        ...projectAccess,
        revokedError:
          err?.response?.data?.error || "Failed to revoke access",
      });
    } finally {
      setAssigning(false);
    }
  };

  /* ================= Assign PROJECT ================= */


  const handleAssignProject = async () => {
    setAssigning(true);
    alert("Hello! This is a simple alert. assign Project" + selectedProject);

    try {
      const res = await assignUserToProjectAPI(
        userDetails.userId,
        selectedProject,
        assignedBy
      );

      const access = await checkUserProjectValidAPI(
        userDetails.userId,
        selectedProject
      );

      console.log("Access after assignment:", access);
      setProjectAccess(access);

      if (res?.status === "success") {
        setProjectAccess({
          ...access,
          assignedMessage: res.message,
        });

        if (selectedProject === 1) {
          settradeUnitporojectAccess({
            isValid: true,
            assignedMessage: res.message,
          });
        }

        // ✅ IMPORTANT: reload selected fund + branch
        await loadAssignedData();



      }
    } catch (err) {
      if (err?.response?.data?.error) {
        setProjectAccess({
          ...projectAccess,
          assignedError: err.response.data.error,
        });
      }
    } finally {
      setAssigning(false);
    }
  };

  /* ================= Assign Fund ================= */
  const fundlisthandleChange = (fundCode) => {
    setSelectedFunds((prev) =>
      prev.includes(fundCode)
        ? prev.filter((code) => code !== fundCode)
        : [...prev, fundCode]
    );
  };

  /* ================= Assign BRANCH ================= */
  const branchListhandleChange = (code) => {
    setSelectedBranches((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const filteredData = branches.filter(
    (b) =>
      b.branchName.toLowerCase().includes(search.toLowerCase()) ||
      b.branchCode.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFunds = funds.filter(
    (fund) =>
      fund.fundName.toLowerCase().includes(fundSearch.toLowerCase()) ||
      fund.fundCode.toLowerCase().includes(fundSearch.toLowerCase())
  );

  // ✅ Select All / Unselect All (filtered list অনুযায়ী কাজ করবে)
  // 🔥 Select All checkbox logic
  const allCodes = filteredFunds.map((f) => f.fundCode);

  const isAllSelected =
    allCodes.length > 0 &&
    allCodes.every((code) => selectedFunds.includes(code));

  const isIndeterminate =
    allCodes.some((code) => selectedFunds.includes(code)) &&
    !isAllSelected;

  const handleFundsSelectAll = () => {
    if (isAllSelected) {
      // Unselect
      setSelectedFunds((prev) =>
        prev.filter((code) => !allCodes.includes(code))
      );
    } else {
      // Select
      setSelectedFunds((prev) => [...new Set([...prev, ...allCodes])]);
    }
  };

  const allbranchCodes = filteredData.map((b) => b.branchCode);

  const isbranchAllSelected =
    allbranchCodes.length > 0 &&
    allbranchCodes.every((code) => selectedBranches.includes(code));

  const isbranchIndeterminate =
    allbranchCodes.some((code) => selectedBranches.includes(code)) &&
    !isbranchAllSelected;

  const handlebranchSelectAll = () => {
    if (isbranchAllSelected) {
      // Unselect
      setSelectedBranches((prev) =>
        prev.filter((code) => !allbranchCodes.includes(code))
      );
    } else {
      // Select
      setSelectedBranches((prev) => [...new Set([...prev, ...allbranchCodes])]);
    }
  };

  const handleSaveFund = async () => {
    if (!selectedFunds.length) {
      alert("Please select at least one fund and one branch");
      return;
    }

    const payloadFunds = {
      userId: userDetails.userId,
      projectId: selectedProject,
      funds: selectedFunds,
      assignedBy
    };
    try {
      // 🔹 Call both APIs
      const fundRes = await assignUserFundAPI(payloadFunds);


      console.log("Fund response:", fundRes);
      alert("Fund successfully ✅");

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Save failed ❌");
    }
  };




  const handleSaveVBranch = async () => {
    if (!selectedBranches.length) {
      alert("Please select at least one branch");
      return;
    }



    const payloadBranch = {
      userId: userDetails.userId,
      projectId: selectedProject,
      branches: selectedBranches,
      assignedBy


    };



    try {
      // 🔹 Call both APIs
      const branchRes = await assignUserBranchAPI(payloadBranch);

      console.log("Branch response:", branchRes);
      alert("Branch assigned successfully ✅");

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Save failed ❌");
    }
  };



  return (
    <Box sx={{ mt: 4, px: 2, width: "100%" }}>

      <FormControl fullWidth>
        <InputLabel>Select User</InputLabel>

        <Select
          value={selectedUser}
          label="Select User"
          onChange={(e) => handleUserChange(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>



          {users.map((user) => (
            <MenuItem key={user} value={user}>
              {user}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <h1 style={{ marginTop: "20px" }}>
        Hello {selectedUser}
      </h1>




      {loadingUser && <p>Loading user details...</p>}
      {userDetails && (
        <Box sx={{ mt: 2 }}>
          <h3>User Details</h3>
          <p>Name: {userDetails.userName}</p>
          <p>Status:  {userDetails.USER_STATUS === "V" ? "Active" : "Inactive"}</p>

          {/* component called UserDetailsCard.jsx*/}
          {userDetails && <UserDetailsCard user={userDetails} />}
          {loadingUser && <CircularProgress sx={{ mt: 3 }} />}

          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Project</InputLabel>

              <Select
                value={selectedProject}
                label="Select project"
                onChange={(e) => handleprojectChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>



                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ACCESS STATUS */}
            {loadingProjectCheck && <CircularProgress sx={{ mt: 3 }} />}
            {projectAccess && (
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {projectAccess.isValid ? (
                    <Alert severity="success">User has access</Alert>
                  ) : (
                    <Alert severity="error">User does not have access</Alert>
                  )}

                  {projectAccess.isValid && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleRevokeProject}
                    >
                      Revoke Access
                    </Button>
                  )}

                  {!projectAccess.isValid && (

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        openConfirm({
                          title: "Assign Project",
                          message: `Are you sure you want to assign this project to ${userDetails.userId}?`,
                          confirmText: "Assign",
                          confirmColor: "primary",
                          onConfirm: async () => {
                            closeConfirm();
                            await handleAssignProject();
                          },
                        })
                      }

                    >
                      Assign Access
                    </Button>
                  )}


                </Stack>
              </Box>
            )}
          </Box>


          {projectAccess?.isValid && selectedProject===1 && (

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Select Funds</Typography>

              {/* 🔍 Search Input */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search fund..."
                value={fundSearch}
                onChange={(e) => setfundSearch(e.target.value)}
                sx={{ my: 1 }}
              />


              {/* 🔥 Select All */}

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
              <FormGroup fullWidth>
                {filteredFunds.map((fund) => (
                  <FormControlLabel
                    key={fund.fundCode}
                    control={
                      <Checkbox
                        checked={selectedFunds.includes(fund.fundCode)}
                        onChange={() => fundlisthandleChange(fund.fundCode)}
                      />
                    }
                    label={`${fund.fundName} (${fund.fundCode})`}
                  />
                ))}
              </FormGroup>
              <Typography variant="subtitle1">Selected Funds:</Typography>
              {selectedFunds.join(", ")}

              <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleSaveFund}

                >
                  Assign Funds
                </Button>
              </Box>

              <Typography variant="h6">Select Branch</Typography>
              {/* 🔍 Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ my: 1 }}
              />

              {/* 🔥 Select All */}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isbranchAllSelected}
                    indeterminate={isbranchIndeterminate}
                    onChange={handlebranchSelectAll}
                  />
                }
                label="Select All"
              />



              {/* ✅ Checkbox List */}
              <FormGroup>
                {filteredData.map((branch) => (
                  <FormControlLabel
                    key={branch.branchCode}
                    control={
                      <Checkbox
                        checked={selectedBranches.includes(branch.branchCode)}
                        onChange={() => branchListhandleChange(branch.branchCode)}
                      />
                    }
                    label={`${branch.branchName} (${branch.branchCode})`}
                  />
                ))}
              </FormGroup>

              {/* 📌 Selected Output */}
              <Box mt={2}>
                <Typography variant="subtitle1">Selected:</Typography>
                {selectedBranches.join(", ")}
              </Box>

              <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
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


          )}


          {/* MENU TREE */}
          {loadingMenus && <CircularProgress sx={{ mt: 3 }} />}

          {projectAccess?.isValid && menus.length > 0 && (
            <UserMenuTree userId={userDetails?.userId} projectId={selectedProject} menus={menus} />
          )}



        </Box>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        confirmColor={confirmConfig.confirmColor}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
      />


    </Box>
  );
};

export default TanvirPage;