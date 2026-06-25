import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Chip,
} from "@mui/material";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import { getUserGridAPI, resetUserPasswordAPI, toggleUserStatusAPI } from "../api/userApi";
import AddUpdateUserModal from "../components/Users/AddUpdateUserModal";
import { useAuth } from "../contexts/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ConfirmDialog from "../components/common/ConfirmDialog";


// ... rest of imports remain the same

const UserPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [serachUserId, setSearchUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [selectedUser, setSelectedUser] = useState(null);

  const { userId } = useAuth();


  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchUserGrid = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await getUserGridAPI({
        serachUserId: filters.serachUserId || "",
        phoneNumber: filters.phoneNumber || "",
      });
      const formattedRows = data.map((row) => ({ id: row.userId, ...row }));
      setRows(formattedRows);
    } catch (error) {
      console.error("Failed to load user grid", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGrid();
  }, []);

  const handleSearch = () => fetchUserGrid({ serachUserId, phoneNumber });
  const handleReset = () => {
    setSearchUserId("");
    setPhoneNumber("");
    fetchUserGrid();
  };

  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setOpenModal(true);
  };

  // =========================
  // New: Handle Edit Click
  // =========================
  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user); // pass the selected row
    setOpenModal(true);
  };

  const handleToggleStatus = (user) => {
    const isActive = user.userStatus === "V";

    openConfirmDialog({
      title: isActive ? "Deactivate User" : "Activate User",
      message: isActive
        ? `Are you sure you want to deactivate user "${user.userId}"?`
        : `Are you sure you want to activate user "${user.userId}"?`,
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          const res = await toggleUserStatusAPI(user.userId);
          if (res?.status === "success") {
            toast.success(res.message);
            fetchUserGrid();
          }
        } catch {
          toast.error("Operation failed");
        } finally {
          setConfirmLoading(false);
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleResetPassword = (user) => {
    openConfirmDialog({
      title: "Reset Password",
      message: `Are you sure you want to reset password for "${user.userId}"?`,
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          const res = await resetUserPasswordAPI(user.userId);
          if (res?.status === "success") {
            toast.success(res.message || "Password reset successfully");
          }
        } catch {
          toast.error("Password reset failed");
        } finally {
          setConfirmLoading(false);
          setConfirmOpen(false);
        }
      },
    });
  };

  const openConfirmDialog = ({ title, message, onConfirm }) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmOpen(true);
  };

  // =========================
  // Columns with Edit handler
  // =========================
  const columns = [
    { field: "userId", headerName: "User ID", flex: 1, minWidth: 120 },
    { field: "userName", headerName: "User Name", flex: 1, minWidth: 120 },
    {
      field: "empId",
      headerName: "Employee ID",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "userStatus",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) =>
        <Chip label={params.value === "V" ? "Active" : "Inactive"} color={params.value === "V" ? "success" : "error"} />,
    },
    { field: "userEmail", headerName: "Email", flex: 1, minWidth: 150 },
    { field: "phoneNumber", headerName: "Phone", flex: 1, minWidth: 120 },
    { field: "designation", headerName: "Designation", flex: 1, minWidth: 120 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isActive = params.row.userStatus === "V";

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Edit */}
            <Tooltip title={isActive ? "Edit" : "Inactive user cannot be edited"}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!isActive}
                  onClick={() => handleEditUser(params.row)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {/* Toggle Active / Inactive */}
            <Tooltip title={isActive ? "Deactivate User" : "Activate User"}>
              <IconButton
                size="small"
                color={isActive ? "error" : "success"}
                onClick={() => handleToggleStatus(params.row)}
              >
                {isActive ? <DeleteIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Reset Password */}
            <Tooltip title="Reset Password">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleResetPassword(params.row)}
              >
                <VpnKeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];



  return (
    <Box sx={{ mt: 4, mb: 4, px: 2, width: "100%" }}>
      <Typography variant="h5" align="center" gutterBottom>
        User Management
      </Typography>

      {/* Filters + Add Button */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="User ID"
            size="small"
            value={serachUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Phone Number"
            size="small"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ minWidth: 200 }}
          />
          <Tooltip title="Search">
            <IconButton color="primary" onClick={handleSearch} sx={{ border: "1px solid", borderColor: "primary.main" }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset">
            <IconButton color="secondary" onClick={handleReset} sx={{ border: "1px solid", borderColor: "secondary.main" }}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser} sx={{ height: 40 }}>
          Add
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ width: "100%", height: 450 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          hideFooter
          components={{
            NoRowsOverlay: () => (
              <GridOverlay>
                <Typography sx={{ mt: 1 }}>No users found</Typography>
              </GridOverlay>
            ),
          }}
        />
      </Box>

      {/* Modal */}
      <AddUpdateUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        mode={modalMode}
        userData={selectedUser}
        onUserAdded={handleReset} // refresh grid after add/edit
        createdUpdateBy={userId}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Confirm"
        loading={confirmLoading}
        onConfirm={confirmAction}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default UserPage;
