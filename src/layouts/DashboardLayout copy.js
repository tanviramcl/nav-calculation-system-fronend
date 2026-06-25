// src/layouts/DashboardLayout.js
import React, { useEffect, useState, useMemo } from "react";
import "./layout.css";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Toolbar,
  AppBar,
  CssBaseline,
  Collapse,
  IconButton,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ExpandLess, ExpandMore, Brightness4, Brightness7 } from "@mui/icons-material";
import { useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import api from "../api/api";
import CONFIG from "../config";
import { getProjectDetails, getUserImage, getUserMenus } from "../api/userApi";
import { toast } from "react-toastify";
import Logo from "../assets/icb_logo.svg";
import LogoWhite from "../assets/icb_logo_white.svg";
import { formatTime } from "../helpers/formatDate";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemIcon from "@mui/material/ListItemIcon";
import DashboardIcon from "@mui/icons-material/Dashboard";


const drawerWidth = 240;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [openParent, setOpenParent] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [userImage, setUserImage] = useState(null);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const year = new Date().getFullYear();
  const projectId = CONFIG.PROJECT_ID;

const theme = useMemo(
  () =>
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",

        ...(darkMode
          ? {}
          : {
              primary: {
                main: "#672d88",
              },
            }),
      },

      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              ...(darkMode
                ? {}
                : {
                    backgroundColor: "#672d88",
                  }),
            },
          },
        },

        MuiButton: {
          styleOverrides: {
            containedPrimary: {
              ...(darkMode
                ? {}
                : {
                    backgroundColor: "#672d88",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#5a2476",
                    },
                  }),
            },
          },
        },
      },
    }),
  [darkMode]
);


  useEffect(() => {
    const loadMenus = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userId = sessionStorage.getItem("userId");
        const project = await getProjectDetails(projectId);
        setProjectName(project.name);

        const data = await getUserMenus(userId, projectId);
        setMenus(data);

        data.forEach((parent) => {
          parent.children.forEach((child) => {
            if (`/${child.menuLink}` === location.pathname) {
              setOpenParent((prev) => ({ ...prev, [parent.parentId]: true }));
              setSelectedMenu(child.menuName);
            }
          });
        });

        // Fetch user image via API
        const imageBlob = await getUserImage(userId);
        const imageObjectUrl = URL.createObjectURL(imageBlob);
        setUserImage(imageObjectUrl);


      } catch (err) {
        console.error(err);
      }
    };

    loadMenus();
  }, [navigate, location.pathname]);

  const toggleParent = (parentId) => {
    setOpenParent((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const handleMenuClick = (link, name) => {
    setSelectedMenu(name);
    navigate(link);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    const userId = sessionStorage.getItem("userId");
    try {
      await api.post("auth/logout", {
        userId: userId,
        projectId: projectId,
      });
      toast.success("Logout successful!");
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Logout failed");
    }
  };

const drawerContent = (
  <Box sx={{ width: drawerWidth, height: "100%", overflowX: "hidden" }}>
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 80, p: 2 }}>
      <img src={darkMode ? LogoWhite : Logo} alt="Logo" style={{ height: 30 }} />
    </Box>

    <List sx={{ px: 1 }}>
      {/* Dashboard Root */}
<ListItemButton
  selected={selectedMenu === "Dashboard"}
  onClick={() => handleMenuClick("/", "Dashboard")}
  sx={{ borderRadius: "8px", mb: 0.5 }}
>
  <ListItemIcon
    sx={{
      minWidth: 36,
      color: selectedMenu === "Dashboard" ? "primary.main" : "inherit",
    }}
  >
    <DashboardIcon />
  </ListItemIcon>

  <ListItemText
    primary="Dashboard"
    primaryTypographyProps={{ fontWeight: 500 }}
  />
</ListItemButton>

      {menus.map((parent) => (
        <Box key={parent.parentId} sx={{ mb: 0.5 }}>
          {/* Parent Node */}
          <ListItemButton 
            onClick={() => toggleParent(parent.parentId)}
            sx={{ borderRadius: "8px" }}
          >
            <ListItemText 
              primary={parent.menuName} 
              primaryTypographyProps={{ fontWeight: 500 }} 
            />
            {openParent[parent.parentId] ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>

          {/* Children (The Tree Branches) */}
          <Collapse in={openParent[parent.parentId]} timeout="auto" unmountOnExit>
            <List 
              component="div" 
              disablePadding 
              sx={{ 
                ml: 2.5, // Indent the sub-menu
                borderLeft: "1px dashed", // The vertical tree line
                borderColor: "divider",
                mt: 0.5,
                mb: 1
              }}
            >
              {parent.children.map((child) => (
                <ListItemButton
                  key={child.menuId}
                  selected={selectedMenu === child.menuName}
                  onClick={() => handleMenuClick(`/${child.menuLink}`, child.menuName)}
                  sx={{ 
                    pl: 3, 
                    py: 0.5,
                    borderRadius: "0 8px 8px 0",
                    position: "relative",
                    "&::before": { // The horizontal connector line
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      width: "12px",
                      height: "1px",
                      backgroundColor: "divider",
                    }
                  }}
                >
                  <ListItemText 
                    primary={child.menuName} 
                    primaryTypographyProps={{ fontSize: "0.875rem" }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}

<ListItemButton
  onClick={handleLogout}
  sx={{
    backgroundColor: darkMode ? "#442222" : "#fff1f1",
    color: darkMode ? "#ff9999" : "#d32f2f",
    "&:hover": { backgroundColor: darkMode ? "#552222" : "#ffe5e5" },
    borderRadius: "8px",
    mt: 4,
    mx: 1,
  }}
>
  <ListItemIcon
    sx={{
      minWidth: 36,
      color: "inherit",
    }}
  >
    <LogoutIcon />
  </ListItemIcon>

  <ListItemText primary="Logout" />
</ListItemButton>
    </List>
  </Box>
);

  const getTokenRemainingTime = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000; // convert to ms
      const now = Date.now();
      return Math.max(exp - now, 0);
    } catch {
      return 0;
    }
  };

  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const updateRemainingTime = () => {
      setRemainingTime(getTokenRemainingTime());
    };

    updateRemainingTime(); // initial
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />

        {/* TOP APP BAR */}
        <AppBar position="fixed">
          <Toolbar
            sx={{
              justifyContent: "space-between",
              ml: !isMobile ? `${drawerWidth}px` : 0,
              width: !isMobile ? `calc(100% - ${drawerWidth}px)` : "100%",
            }}
          >
            {isMobile && (
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              noWrap
              sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
            >
              {projectName}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* User Image */}
              <Tooltip
                title={
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      src={userImage || "/default.jpg"}
                      alt="User"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: 8
                      }}
                    />
                    <Typography variant="body2">
                      Session expires in
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", color: "orange" }}
                    >
                      {formatTime(remainingTime)}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <img
                  src={userImage || "/default.jpg"}
                  alt="User"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer"
                  }}
                />
              </Tooltip>

              {!isMobile && (
                <>
                  <Typography variant="subtitle1">
                    {sessionStorage.getItem("userId")}
                  </Typography>
                </>
              )}

              {/* Dark / Light Mode Toggle */}
              <IconButton
                sx={{ ml: 1 }}
                onClick={() => setDarkMode(!darkMode)}
                color="inherit"
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* MOBILE DRAWER */}
        {isMobile && (
          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* DESKTOP DRAWER */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* MAIN CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mx: 3,
            mt: 8,
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
            maxWidth: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>

          {/* FOOTER */}
          <Box
            sx={{
              textAlign: "center",
              py: 1,
              borderTop: "1px solid #ddd",
              color: "text.secondary",
              fontSize: "14px",
            }}
          >
            {year} © All rights reserved. Developed by IAMPLC Software Department.
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;
