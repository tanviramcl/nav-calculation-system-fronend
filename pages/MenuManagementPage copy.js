import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";

import {
  userDropdownAPI,
  getUserDetailsAPI,
  getAllProjectsAPI,
  checkUserProjectValidAPI,
  assignUserToProjectAPI,
  getUserMenusAPI,
  revokeUserFromProjectAPI,
} from "../api/userApi";

import UserDetailsCard from "../components/Menus/UserDetailsCard";
import UserMenuTree from "../components/Menus/UserMenuTree";
import { useAuth } from "../contexts/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AssignFundSection from "../components/Menus/AssignFundSection";
import AssignBranchSection from "../components/Menus/AssignBranchSection";


const MenuManagementPage = () => {
  const { userId: assignedBy } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectAccess, setProjectAccess] = useState(null);

  const [menus, setMenus] = useState([]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingProjectCheck, setLoadingProjectCheck] = useState(false);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [assigning, setAssigning] = useState(false);

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
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
  };

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    userDropdownAPI().then(setUsers);
  }, []);

  /* ================= LOAD PROJECTS ================= */
  useEffect(() => {
    if (userDetails) {
      getAllProjectsAPI().then(setProjects);
      console.log("Projects:", projects);
    } else {
      setProjects([]);
    }
  }, [userDetails]);

  /* ================= USER CHANGE ================= */
  const handleUserChange = async (userId) => {
    setSelectedUser(userId);
    setUserDetails(null);
    setSelectedProject("");
    setProjectAccess(null);
    setMenus([]);
    setLoadingUser(true);

    try {
      const data = await getUserDetailsAPI(userId);
      setUserDetails(data);
    } finally {
      setLoadingUser(false);
    }
  };

  /* ================= PROJECT CHANGE ================= */
  const handleProjectChange = async (projectId) => {
    const numericProjectId = Number(projectId);

    setSelectedProject(numericProjectId);
    setProjectAccess(null);
    setMenus([]);
    setLoadingProjectCheck(true);

    try {
      const res = await checkUserProjectValidAPI(
        userDetails.userId,
        numericProjectId
      );
      setProjectAccess(res);
    } finally {
      setLoadingProjectCheck(false);
    }
  };

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

  /* ================= ASSIGN PROJECT ================= */
  const handleAssignProject = async () => {
    setAssigning(true);

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
      setProjectAccess(access);

      if (res?.status === "success") {
        setProjectAccess({
          ...access,
          assignedMessage: res.message,
        });
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

  return (
    <Box sx={{ mt: 4, px: 2, width: "100%" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Menu Management
      </Typography>

      {/* USER DROPDOWN */}
      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
        <InputLabel>Select User</InputLabel>
        <Select
          value={selectedUser}
          label="Select User"
          onChange={(e) => handleUserChange(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {users.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loadingUser && <CircularProgress sx={{ mt: 3 }} />}

      {userDetails && <UserDetailsCard user={userDetails} />}

      {/* PROJECT DROPDOWN */}
      {userDetails && (
        <Box sx={{ mt: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProject}
              label="Select Project"
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

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
                onClick={() =>
                  openConfirm({
                    title: "Revoke Project Access",
                    message: `Are you sure you want to revoke this project from ${userDetails.userId}?`,
                    confirmText: "Revoke",
                    confirmColor: "error",
                    onConfirm: async () => {
                      closeConfirm();
                      await handleRevokeProject();
                    },
                  })
                }
                disabled={assigning}
              >
                Revoke Access
              </Button>
            )}

            {!projectAccess.isValid && (
              <Button
                variant="contained"
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
                disabled={assigning}
              >
                Assign Access
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {projectAccess?.isValid &&
        selectedProject === 1 && (

          <Box sx={{ mt: 3 }}>

            {/* FUND SECTION */}
            <AssignFundSection
              funds={funds}
              selectedFunds={selectedFunds}
              setSelectedFunds={setSelectedFunds}
              userDetails={userDetails}
              selectedProject={selectedProject}
              assignedBy={assignedBy}
              assignUserFundAPI={assignUserFundAPI}
            />

            {/* BRANCH SECTION */}
            <AssignBranchSection
              branches={branches}
              selectedBranches={selectedBranches}
              setSelectedBranches={
                setSelectedBranches
              }
              userDetails={userDetails}
              selectedProject={selectedProject}
              assignedBy={assignedBy}
              assignUserBranchAPI={
                assignUserBranchAPI
              }
            />

          </Box>
        )}

      {/* MENU TREE */}
      {loadingMenus && <CircularProgress sx={{ mt: 3 }} />}

      {projectAccess?.isValid && menus.length > 0 && (
        <UserMenuTree userId={userDetails?.userId} projectId={selectedProject} menus={menus} />
      )}

      {projectAccess?.isValid && menus.length === 0 && !loadingMenus && (
        <Alert sx={{ mt: 3 }} severity="info">
          No menus assigned for this project
        </Alert>
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

export default MenuManagementPage;
