import React, { useState, useEffect } from "react";
import { Box, Checkbox, Typography, Stack, Divider, Button } from "@mui/material";
import { toast } from "react-toastify";
import { updateUserMenusAPI } from "../../api/userApi";
import ConfirmDialog from "../common/ConfirmDialog";



// ======= BUILD TREE FROM FLAT DATA =======
const buildTree = (flatMenus) => {
  const map = {};
  const roots = [];

  flatMenus.forEach((m) => {
    map[m.menuId] = { ...m, children: [] };
  });

  flatMenus.forEach((m) => {
    if (m.parentId === 0) {
      roots.push(map[m.menuId]);
    } else if (map[m.parentId]) {
      map[m.parentId].children.push(map[m.menuId]);
    }
  });

  return roots;
};

// ======= CHUNK ARRAY INTO N ITEMS PER ROW =======
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const UserMenuTree = ({ menus, userId, projectId }) => {
  const [menuData, setMenuData] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (menus) setMenuData(buildTree(menus));
  }, [menus]);

  // ======= HANDLE PARENT CLICK =======
  const handleParentToggle = (menu) => {
    const newValue = !menu.hasPermission;

    const toggleChildren = (m) => ({
      ...m,
      hasPermission: newValue,
      children: m.children?.map(toggleChildren) || [],
    });

    setMenuData(menuData.map((m) =>
      m.menuId === menu.menuId ? toggleChildren(m) : m
    ));
  };

  // ======= HANDLE CHILD CLICK =======
  const handleChildToggle = (menuId) => {
    const toggleChild = (items) => {
      return items.map((m) => {
        if (m.menuId === menuId) {
          return { ...m, hasPermission: !m.hasPermission };
        }
        if (m.children?.length) {
          const updatedChildren = toggleChild(m.children);
          const anyChildChecked = updatedChildren.some(c => c.hasPermission);
          return { ...m, hasPermission: anyChildChecked ? true : m.hasPermission, children: updatedChildren };
        }
        return m;
      });
    };
    setMenuData(toggleChild(menuData));
  };

  // ======= GET SELECTED MENU IDS =======
  const getSelectedMenuIds = (items) => {
    let ids = [];
    items.forEach((m) => {
      if (m.hasPermission) ids.push(m.menuId);
      if (m.children?.length) ids = ids.concat(getSelectedMenuIds(m.children));
    });
    return ids;
  };

  // ======= UPDATE MENU API =======
  const handleUpdateMenus = async () => {
    if (!userId || !projectId) {
      toast.warning("User or Project is missing!");
      return;
    }

    const menuIds = getSelectedMenuIds(menuData);

    setUpdating(true);
    try {
      const res = await updateUserMenusAPI(userId, projectId, menuIds);
      if (res?.data?.status === "success") toast.success(res.data.message);
      else toast.error("Failed to update menu permissions");
    } catch (err) {
      console.error(err);
      toast.error("Error updating menu permissions");
    } finally {
      setUpdating(false);
      setConfirmOpen(false);
    }
  };

  if (!menuData?.length) return <Typography sx={{ mt: 3 }}>No menus found.</Typography>;

  // ======= RENDER MENU ROW WITH CHILDREN IN 2 COLUMNS PER ROW =======
  const renderMenu = (menu, level = 0) => (
    <Box key={menu.menuId} sx={{ mt: 1 }}>
      {/* Parent Menu */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: level * 3 }}>
        <Checkbox
          size="small"
          checked={menu.hasPermission}
          onChange={() =>
            menu.parentId === 0
              ? handleParentToggle(menu)
              : handleChildToggle(menu.menuId)
          }
        />
        <Typography variant="body2" fontWeight={menu.parentId === 0 ? 600 : 400}>
          {menu.menuCaption}
        </Typography>
      </Stack>

      {/* Child Menus */}
{menu.children?.length > 0 && (
  <Box sx={{ ml: (level + 1) * 3, mt: 1 }}>
    {chunkArray(menu.children, 2).map((row, rowIndex) => (
      <Stack direction="row" spacing={2} key={rowIndex} sx={{ mb: 0.5 }}>
        {row.map((child) => (
          <Box
            key={child.menuId}
            sx={{
              display: "flex",
              alignItems: "center",
              width: 300, // FIXED WIDTH for each column
            }}
          >
            <Checkbox
              size="small"
              checked={child.hasPermission}
              onChange={() => handleChildToggle(child.menuId)}
            />
            <Typography variant="body2">{child.menuCaption}</Typography>
          </Box>
        ))}
      </Stack>
    ))}
  </Box>
)}
    </Box>
  );

  const handleConfirmUpdate = () => {
  setConfirmOpen(true);
};

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        User Menu Permissions
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {menuData.map((menu) => renderMenu(menu))}

      <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleConfirmUpdate}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update Menus"}
        </Button>
      </Box>
      <ConfirmDialog
  open={confirmOpen}
  title="Update Menu Permissions"
  message="Are you sure you want to update menu permissions for this user?"
  confirmText="Update"
  confirmColor="primary"
  onClose={() => setConfirmOpen(false)}
  onConfirm={handleUpdateMenus}
/>
    </Box>
  );
};

export default UserMenuTree;