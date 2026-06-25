import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  checkUserIdExists,
  getActiveEmployees,
  saveUserAPI,
  getUserImage,
  updateUserAPI,
} from "../../api/userApi";
import { toast } from "react-toastify";
import ConfirmDialog from "../common/ConfirmDialog"; // ✅ import

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^\d{11}$/.test(phone);
};

const AddUpdateUserModal = ({
  open,
  onClose,
  mode = "add",
  userData = null,
  onUserAdded,
  createdUpdateBy,
}) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [empId, setEmpId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [checkingUserId, setCheckingUserId] = useState(false);
  const [userExists, setUserExists] = useState(false);

  // ✅ Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);


  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  /* =========================
     Fetch Active Employees
  ========================= */
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await getActiveEmployees();
      setEmployees(res || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  /* =========================
     Load Modal Data
  ========================= */
  useEffect(() => {
    if (!open) return;

    fetchEmployees();

    if (mode === "add") {
      setSelectedEmpId("");
      setUserId("");
      setUserName("");
      setUserEmail("");
      setPhoneNumber("");
      setEmpId("");
      setImageFile(null);
      setImagePreview(null);
      setUserExists(false);
    } else if (userData) {
      setSelectedEmpId(userData.empId || "");
      setUserId(userData.userId || "");
      setUserName(userData.userName || "");
      setUserEmail(userData.userEmail || "");
      setPhoneNumber(userData.phoneNumber || "");
      setEmpId(userData.empId || "");
      setImageFile(null);
      setUserExists(false);

      const loadUserImage = async () => {
        try {
          const res = await getUserImage(userData.userId);
          if (res instanceof Blob) {
            setImagePreview(URL.createObjectURL(res));
          } else {
            setImagePreview(res || null);
          }
        } catch {
          setImagePreview(null);
        }
      };
      loadUserImage();
    }
  }, [open, mode, userData]);

  /* =========================
     Employee Selection
  ========================= */
  const handleEmployeeChange = (empId) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => String(e.empId) === String(empId));
    if (emp) {
      setUserName(emp.name);
      setEmpId(emp.empId);
    }
  };

  /* =========================
     Check User Exists
  ========================= */
  useEffect(() => {
    if (mode !== "add" || userId.length < 3) {
      setUserExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingUserId(true);
        const res = await checkUserIdExists(userId);
        setUserExists(res);
      } catch {
        setUserExists(false);
      } finally {
        setCheckingUserId(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [userId, mode]);

  /* =========================
     Image Upload
  ========================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  /* =========================
     ACTUAL SAVE (after confirm)
  ========================= */
  const handleSaveUser = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("UserID", userId);
      formData.append("UserName", userName);
      formData.append("UserEmail", userEmail);
      formData.append("PhoneNumber", phoneNumber);
      formData.append("LastUpdatedBy", createdUpdateBy);
      if (imageFile) formData.append("ImageFile", imageFile);

      let response;
      if (mode === "add") {
        formData.append("empId", empId);
        response = await saveUserAPI(formData);
      } else {
        response = await updateUserAPI(formData);
      }

      if (response?.status === "success") {
        toast.success(response.message);
        onClose();
        onUserAdded?.();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch {
      toast.error("Error saving/updating user");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      {/* ================= MODAL ================= */}
      <Modal open={open} onClose={onClose}>
        <Box sx={{ width: 450, p: 3, bgcolor: "background.paper", borderRadius: 2, mx: "auto", mt: "10%" }}>
          <Typography variant="h6">
            {mode === "add" ? "Add User" : "Update User"}
          </Typography>

          {imagePreview && (
            <Box sx={{ textAlign: "center", my: 2 }}>
              <Avatar src={imagePreview} sx={{ width: 80, height: 80, mx: "auto" }} />
            </Box>
          )}

          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmpId}
              label="Select Employee"
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={mode === "edit"}
            >
              {loadingEmployees && (
                <MenuItem disabled>
                  <CircularProgress size={18} />
                </MenuItem>
              )}
              {employees.map((emp) => (
                <MenuItem key={emp.empId} value={emp.empId}>
                  {emp.name} ({emp.designation})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="User ID" fullWidth size="small" sx={{ mt: 2 }}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            error={userExists}
            helperText={userExists ? "User already exists" : ""}
            InputProps={{ readOnly: mode === "edit" }}
          />

          <TextField label="User Name" fullWidth size="small" sx={{ mt: 2 }}
            value={userName} onChange={(e) => setUserName(e.target.value)} />

          <TextField
            label="Email"
            fullWidth
            size="small"
            sx={{ mt: 2 }}
            value={userEmail}
            onChange={(e) => {
              const value = e.target.value;
              setUserEmail(value);

              if (value && !isValidEmail(value)) {
                setEmailError("Invalid email format");
              } else {
                setEmailError("");
              }
            }}
            error={!!emailError}
            helperText={emailError}
          />

          <TextField
            label="Phone Number"
            fullWidth
            size="small"
            sx={{ mt: 2 }}
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // only digits
              setPhoneNumber(value);

              if (value && !isValidPhone(value)) {
                setPhoneError("Phone number must be 11 digits");
              } else {
                setPhoneError("");
              }
            }}
            inputProps={{ maxLength: 11 }}
            error={!!phoneError}
            helperText={phoneError}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" fullWidth>
              Upload Image
              <input hidden type="file" accept="image/*" onChange={handleImageChange} />
            </Button>
          </Box>

          <Box sx={{ textAlign: "right", mt: 3 }}>
          <Button
            variant="contained"
            disabled={
              userExists ||
              checkingUserId ||
              !!emailError ||
              !!phoneError
            }
            onClick={() => setConfirmOpen(true)}
          >
            {mode === "add" ? "Add" : "Update"}
          </Button>
            <Button sx={{ ml: 1 }} variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* ================= CONFIRM DIALOG ================= */}
      <ConfirmDialog
        open={confirmOpen}
        title={mode === "add" ? "Confirm Add User" : "Confirm Update User"}
        message={
          mode === "add"
            ? "Are you sure you want to add this user?"
            : "Are you sure you want to update this user?"
        }
        confirmText={mode === "add" ? "Add User" : "Update User"}
        loading={saving}
        onConfirm={handleSaveUser}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default AddUpdateUserModal;
