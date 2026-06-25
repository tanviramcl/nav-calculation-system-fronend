import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Button,
  Alert,
} from "@mui/material";

import {
  userDropdownAPI,
  getUserDetailsAPI,
  getAllProjectsAPI,
  checkUserProjectValidAPI,
  assignUserToProjectAPI,
  fundsDropdownAPI,
  revokeUserFromProjectAPI,
  getUserMenusAPI,
  baranchDropdownAPI,
  getUserFundsAPI,
  getUserBranchesAPI,
  assignUserFundAPI,
  assignUserBranchAPI,
} from "../api/userApi";

import { useAuth } from "../contexts/AuthContext";

import UserDetailsCard from "../components/Menus/UserDetailsCard";
import UserMenuTree from "../components/Menus/UserMenuTree";
import ConfirmDialog from "../components/common/ConfirmDialog";

import AssignFundSection from "../components/Menus/AssignFundSection";
import AssignBranchSection from "../components/Menus/AssignBranchSection";

const TanvirPage = () => {

  /* ================= STATES ================= */

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState("");

  const [userDetails, setUserDetails] =
    useState(null);

  const [loadingUser, setLoadingUser] =
    useState(false);

  const [projects, setProjects] =
    useState([]);

  const [selectedProject, setSelectedProject] =
    useState("");

  const [projectAccess, setProjectAccess] =
    useState(null);

  const [
    loadingProjectCheck,
    setLoadingProjectCheck,
  ] = useState(false);

  const [menus, setMenus] = useState([]);

  const [loadingMenus, setLoadingMenus] =
    useState(false);

  const [assigning, setAssigning] =
    useState(false);

  const { userId: assignedBy } = useAuth();

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [confirmConfig, setConfirmConfig] =
    useState({
      title: "",
      message: "",
      onConfirm: null,
      confirmText: "Confirm",
      confirmColor: "primary",
    });

  const [funds, setFunds] = useState([]);

  const [selectedFunds, setSelectedFunds] =
    useState([]);

  const [branches, setBranches] =
    useState([]);

  const [
    selectedBranches,
    setSelectedBranches,
  ] = useState([]);

  /* ================= CONFIRM ================= */

  const openConfirm = (config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
  };

  /* ================= LOAD USERS ================= */

  useEffect(() => {

    userDropdownAPI().then((data) => {
      setUsers(data);
    });

  }, []);

  /* ================= LOAD PROJECTS ================= */

  useEffect(() => {

    if (userDetails) {
      getAllProjectsAPI().then(setProjects);
    } else {
      setProjects([]);
    }

  }, [userDetails]);

  /* ================= LOAD FUNDS + BRANCH ================= */

  useEffect(() => {

    if (projectAccess) {

      fundsDropdownAPI().then(setFunds);

      baranchDropdownAPI().then(setBranches);

    } else {

      setFunds([]);
      setBranches([]);

    }

  }, [projectAccess]);

  /* ================= LOAD ASSIGNED DATA ================= */

  useEffect(() => {

    if (
      userDetails?.userId &&
      selectedProject
    ) {
      loadAssignedData();
    }

  }, [
    userDetails,
    selectedProject,
    projectAccess,
  ]);

  const loadAssignedData = async () => {

    try {

      const assignedFunds =
        await getUserFundsAPI(
          userDetails.userId
        );

      const assignedBranches =
        await getUserBranchesAPI(
          userDetails.userId
        );

      setSelectedFunds(
        assignedFunds.map(
          (x) => x.fundCode
        )
      );

      setSelectedBranches(
        assignedBranches.map(
          (x) => x.branchCode
        )
      );

    } catch (err) {

      console.error(err);

    }
  };

  /* ================= USER CHANGE ================= */

  const handleUserChange = async (
    userId
  ) => {

    setSelectedUser(userId);

    setUserDetails(null);

    setSelectedProject("");

    setProjectAccess(null);

    setSelectedFunds([]);

    setSelectedBranches([]);

    setMenus([]);

    setLoadingUser(true);

    try {

      const data =
        await getUserDetailsAPI(userId);

      setUserDetails(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoadingUser(false);

    }
  };

  /* ================= PROJECT CHANGE ================= */

  const handleprojectChange = async (
    projectId
  ) => {

    const numericProjectId =
      Number(projectId);

    setSelectedProject(
      numericProjectId
    );

    setProjectAccess(null);

    setSelectedFunds([]);

    setSelectedBranches([]);

    setMenus([]);

    setLoadingProjectCheck(true);

    try {

      const res =
        await checkUserProjectValidAPI(
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

          const data =
            await getUserMenusAPI(
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

  }, [
    projectAccess,
    userDetails,
    selectedProject,
  ]);

  /* ================= REVOKE ================= */

  const handleRevokeProject =
    async () => {

      setAssigning(true);

      try {

        const res =
          await revokeUserFromProjectAPI(
            userDetails.userId,
            selectedProject
          );

        const access =
          await checkUserProjectValidAPI(
            userDetails.userId,
            selectedProject
          );

        setProjectAccess({
          ...access,
          revokedMessage:
            res?.message ||
            "Access revoked successfully",
        });

        setMenus([]);

      } catch (err) {

        setProjectAccess({
          ...projectAccess,
          revokedError:
            err?.response?.data?.error ||
            "Failed to revoke access",
        });

      } finally {

        setAssigning(false);

      }
    };

  /* ================= ASSIGN PROJECT ================= */

  const handleAssignProject =
    async () => {

      setAssigning(true);

      try {

        const res =
          await assignUserToProjectAPI(
            userDetails.userId,
            selectedProject,
            assignedBy
          );

        const access =
          await checkUserProjectValidAPI(
            userDetails.userId,
            selectedProject
          );

        setProjectAccess(access);

        if (res?.status === "success") {

          setProjectAccess({
            ...access,
            assignedMessage:
              res.message,
          });

          await loadAssignedData();
        }

      } catch (err) {

        if (
          err?.response?.data?.error
        ) {

          setProjectAccess({
            ...projectAccess,
            assignedError:
              err.response.data.error,
          });
        }

      } finally {

        setAssigning(false);

      }
    };

  /* ================= UI ================= */

  return (
    <Box
      sx={{
        mt: 4,
        px: 2,
        width: "100%",
      }}
    >

      {/* USER SELECT */}

      <FormControl fullWidth>

        <InputLabel>
          Select User
        </InputLabel>

        <Select
          value={selectedUser}
          label="Select User"
          onChange={(e) =>
            handleUserChange(
              e.target.value
            )
          }
        >

          <MenuItem value="">
            <em>None</em>
          </MenuItem>

          {users.map((user) => (
            <MenuItem
              key={user}
              value={user}
            >
              {user}
            </MenuItem>
          ))}

        </Select>

      </FormControl>

      

      {/* USER DETAILS */}

      {loadingUser && (
        <p>Loading user details...</p>
      )}

      {userDetails && (

        <Box sx={{ mt: 2 }}>

          <UserDetailsCard
            user={userDetails}
          />

          {/* PROJECT SELECT */}

          <Box sx={{ mt: 2 }}>

            <FormControl fullWidth>

              <InputLabel>
                Select Project
              </InputLabel>

              <Select
                value={selectedProject}
                label="Select project"
                onChange={(e) =>
                  handleprojectChange(
                    e.target.value
                  )
                }
              >

                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                {projects.map(
                  (project) => (
                    <MenuItem
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </MenuItem>
                  )
                )}

              </Select>

            </FormControl>

            {/* ACCESS STATUS */}

            {loadingProjectCheck && (
              <CircularProgress
                sx={{ mt: 3 }}
              />
            )}

            {projectAccess && (

              <Box sx={{ mt: 3 }}>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >

                  {projectAccess.isValid ? (
                    <Alert severity="success">
                      User has access
                    </Alert>
                  ) : (
                    <Alert severity="error">
                      User does not have
                      access
                    </Alert>
                  )}

                  {projectAccess.isValid && (

                    <Button
                      variant="contained"
                      color="error"
                      onClick={
                        handleRevokeProject
                      }
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
                          title:
                            "Assign Project",
                          message: `Are you sure you want to assign this project to ${userDetails.userId}?`,
                          confirmText:
                            "Assign",
                          confirmColor:
                            "primary",
                          onConfirm:
                            async () => {
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

          {/* FUND + BRANCH */}

          {projectAccess?.isValid &&
            selectedProject === 1 && (

              <Box sx={{ mt: 3 }}>

                <AssignFundSection
                  funds={funds}
                  selectedFunds={
                    selectedFunds
                  }
                  setSelectedFunds={
                    setSelectedFunds
                  }
                  userDetails={
                    userDetails
                  }
                  selectedProject={
                    selectedProject
                  }
                  assignedBy={
                    assignedBy
                  }
                  assignUserFundAPI={
                    assignUserFundAPI
                  }
                />

                <AssignBranchSection
                  branches={branches}
                  selectedBranches={
                    selectedBranches
                  }
                  setSelectedBranches={
                    setSelectedBranches
                  }
                  userDetails={
                    userDetails
                  }
                  selectedProject={
                    selectedProject
                  }
                  assignedBy={
                    assignedBy
                  }
                  assignUserBranchAPI={
                    assignUserBranchAPI
                  }
                />

              </Box>

            )}

          {/* MENU TREE */}

          {loadingMenus && (
            <CircularProgress
              sx={{ mt: 3 }}
            />
          )}

          {projectAccess?.isValid &&
            menus.length > 0 && (

              <UserMenuTree
                userId={
                  userDetails?.userId
                }
                projectId={
                  selectedProject
                }
                menus={menus}
              />

            )}

        </Box>

      )}

      {/* CONFIRM DIALOG */}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={
          confirmConfig.confirmText
        }
        confirmColor={
          confirmConfig.confirmColor
        }
        onClose={closeConfirm}
        onConfirm={
          confirmConfig.onConfirm
        }
      />

    </Box>
  );
};

export default TanvirPage;