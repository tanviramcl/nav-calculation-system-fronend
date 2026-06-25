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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ExpandLess, ExpandMore, Brightness4, Brightness7 } from "@mui/icons-material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import api from "../api/api";
import CONFIG from "../config";
import { getProjectDetails, getUserImage, getUserMenus } from "../api/userApi";
import { toast } from "react-toastify";
import Logo from "../assets/icb_logo.svg";
import LogoWhite from "../assets/icb_logo_white.svg";
import LogoMark from "../assets/icb_logo_mark.jpeg";
import { formatTime } from "../helpers/formatDate";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemIcon from "@mui/material/ListItemIcon";
import DashboardIcon from "@mui/icons-material/Dashboard";

const DRAWER_EXPANDED = 240;
const DRAWER_COLLAPSED = 64;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [openParent, setOpenParent] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [userImage, setUserImage] = useState(null);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const year = new Date().getFullYear();
  const projectId = CONFIG.PROJECT_ID;
  const drawerWidth = sidebarCollapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          ...(!darkMode && { primary: { main: "#672d88" } }),
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                ...(!darkMode && { backgroundColor: "#672d88" }),
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              containedPrimary: {
                ...(!darkMode && {
                  backgroundColor: "#672d88",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#5a2476" },
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
      if (!token) { navigate("/login"); return; }
      try {
        const userId = sessionStorage.getItem("userId");
        const project = await getProjectDetails(projectId);
        setProjectName(project.name);

        const data = await getUserMenus(userId, projectId);



      //  console.log("Fetched menus:", userId, projectId, data);


        
        setMenus(data);

        data.forEach((parent) => {
          parent.children.forEach((child) => {
            if (`/${child.menuLink}` === location.pathname) {
              setOpenParent((prev) => ({ ...prev, [parent.parentId]: true }));
              setSelectedMenu(child.menuName);
            }
          });
        });

        const imageBlob = await getUserImage(userId);
        setUserImage(URL.createObjectURL(imageBlob));
      } catch (err) {
        console.error(err);
      }
    };
    loadMenus();
  }, [navigate, location.pathname]);

  const toggleParent = (parentId) =>
    setOpenParent((prev) => ({ ...prev, [parentId]: !prev[parentId] }));

  const handleMenuClick = (link, name) => {
    setSelectedMenu(name);
    navigate(link);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    const userId = sessionStorage.getItem("userId");
    try {
      await api.post("auth/logout", { userId, projectId });
      toast.success("Logout successful!");
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Logout failed");
    }
  };

  // ─── Drawer Content ───────────────────────────────────────────────────────
  const buildDrawerContent = (isCollapsed = false) => (
    <Box
      sx={{
        width: isCollapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED,
        height: "100%",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column", // ← column so footer sticks to bottom
        transition: "width 0.25s ease",
      }}
    >
      {/* ── Logo Area ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: isCollapsed ? "center" : "space-between",
          alignItems: "center",
          height: 64,
          px: isCollapsed ? 0 : 2,
          flexShrink: 0,
        }}
      >
        {isCollapsed ? (
          <Tooltip title="IAMCL" placement="right">
            <img
              src={LogoMark}
              alt="IAMCL"
              style={{ height: 36, width: 36, objectFit: "contain", cursor: "pointer" }}
              onClick={() => setSidebarCollapsed(false)}
            />
          </Tooltip>
        ) : (
          <>
            <img
              src={darkMode ? LogoWhite : Logo}
              alt="ICB Asset Management"
              style={{ height: 30 }}
            />
            {!isMobile && (
              <IconButton
                size="small"
                onClick={() => setSidebarCollapsed(true)}
                sx={{ color: "text.secondary" }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
          </>
        )}
      </Box>

      {/* ── Scrollable Menu List ── */}
      {/* flex: 1 makes this grow and push the footer all the way down */}
      <List
        sx={{
          px: isCollapsed ? 0.5 : 1,
          flex: 1,           // ← takes all remaining space
          overflowY: "auto", // ← scrolls if menus overflow
          overflowX: "hidden",
        }}
      >
        {/* Dashboard */}
        <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
          <ListItemButton
            selected={selectedMenu === "Dashboard"}
            onClick={() => handleMenuClick("/", "Dashboard")}
            sx={{
              borderRadius: "8px",
              mb: 0.5,
              justifyContent: isCollapsed ? "center" : "flex-start",
              px: isCollapsed ? 1 : 2,
              minHeight: 44,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isCollapsed ? 0 : 36,
                color: selectedMenu === "Dashboard" ? "primary.main" : "inherit",
                justifyContent: "center",
              }}
            >
              <DashboardIcon />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        {/* Dynamic menus */}
        {menus.map((parent) => (
          <Box key={parent.parentId} sx={{ mb: 0.5 }}>
            {isCollapsed ? (
              <Tooltip title={parent.menuName} placement="right">
                <ListItemButton
                  onClick={() => {
                    setSidebarCollapsed(false);
                    setOpenParent((prev) => ({ ...prev, [parent.parentId]: true }));
                  }}
                  sx={{ borderRadius: "8px", justifyContent: "center", px: 1, minHeight: 44 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                    <Box
                      sx={{
                        width: 28, height: 28,
                        borderRadius: "6px",
                        backgroundColor: "primary.main",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {parent.menuName?.charAt(0).toUpperCase()}
                    </Box>
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            ) : (
              <>
                <ListItemButton
                  onClick={() => toggleParent(parent.parentId)}
                  sx={{ borderRadius: "8px" }}
                >
                  <ListItemText
                    primary={parent.menuName}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  {openParent[parent.parentId]
                    ? <ExpandLess sx={{ fontSize: 18 }} />
                    : <ExpandMore sx={{ fontSize: 18 }} />}
                </ListItemButton>

                <Collapse in={openParent[parent.parentId]} timeout="auto" unmountOnExit>
                  <List
                    component="div"
                    disablePadding
                    sx={{
                      ml: 2.5,
                      borderLeft: "1px dashed",
                      borderColor: "divider",
                      mt: 0.5,
                      mb: 1,
                    }}
                  >
                    {parent.children.map((child) => (
                      <ListItemButton
                        key={child.menuId}
                        selected={selectedMenu === child.menuName}
                        onClick={() => handleMenuClick(`/${child.menuLink}`, child.menuName)}
                        sx={{
                          pl: 3, py: 0.5,
                          borderRadius: "0 8px 8px 0",
                          position: "relative",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0, top: "50%",
                            width: "12px", height: "1px",
                            backgroundColor: "divider",
                          },
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
              </>
            )}
          </Box>
        ))}
      </List>

      {/* ── FOOTER: always pinned to the very bottom ── */}
      <Box
        sx={{
          flexShrink: 0,                         // never shrinks
          px: isCollapsed ? "6px" : 1,
          py: 1,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Expand chevron (collapsed desktop only) */}
        {isCollapsed && !isMobile && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
            <Tooltip title="Expand sidebar" placement="right">
              <IconButton
                size="small"
                onClick={() => setSidebarCollapsed(false)}
                sx={{ color: "text.secondary" }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Logout button — always at the very bottom */}
        <Tooltip title={isCollapsed ? "Logout" : ""} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              backgroundColor: darkMode ? "#442222" : "#fff1f1",
              color: darkMode ? "#ff9999" : "#d32f2f",
              "&:hover": { backgroundColor: darkMode ? "#552222" : "#ffe5e5" },
              borderRadius: "8px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              px: isCollapsed ? 1 : 1.5,
              minHeight: 44,
            }}
          >
            <ListItemIcon
              sx={{ minWidth: isCollapsed ? 0 : 36, color: "inherit", justifyContent: "center" }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // ─── Session timer ────────────────────────────────────────────────────────
  const getTokenRemainingTime = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Math.max(payload.exp * 1000 - Date.now(), 0);
    } catch { return 0; }
  };

  const [remainingTime, setRemainingTime] = useState(0);
  useEffect(() => {
    setRemainingTime(getTokenRemainingTime());
    const interval = setInterval(() => setRemainingTime(getTokenRemainingTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />

        {/* TOP APP BAR */}
        <AppBar
          position="fixed"
          sx={{
            transition: "margin-left 0.25s ease, width 0.25s ease",
            ...(!isMobile && {
              ml: `${drawerWidth}px`,
              width: `calc(100% - ${drawerWidth}px)`,
            }),
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {isMobile && (
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" noWrap sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
              {projectName}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip
                title={
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      src={userImage || "/default.jpg"}
                      alt="User"
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }}
                    />
                    <Typography variant="body2">Session expires in</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "orange" }}>
                      {formatTime(remainingTime)}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <img
                  src={userImage || "/default.jpg"}
                  alt="User"
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                />
              </Tooltip>

              {!isMobile && (
                <Typography variant="subtitle1">
                  {sessionStorage.getItem("userId")}
                </Typography>
              )}

              <IconButton sx={{ ml: 1 }} onClick={() => setDarkMode(!darkMode)} color="inherit">
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
            sx={{ "& .MuiDrawer-paper": { width: DRAWER_EXPANDED } }}
          >
            {buildDrawerContent(false)}
          </Drawer>
        )}

        {/* DESKTOP DRAWER */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              transition: "width 0.25s ease",
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                overflowX: "hidden",
                transition: "width 0.25s ease",
              },
            }}
          >
            {buildDrawerContent(sidebarCollapsed)}
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
            transition: "margin-left 0.25s ease",
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