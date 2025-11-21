import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
}));

const Header = ({ onDrawerToggle }: { onDrawerToggle: () => void }) => {
  return (
    <StyledAppBar
      position="fixed"
      sx={{ width: { sm: `calc(100% - 260px)` }, ml: { sm: "260px" } }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
        ></Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <Avatar
              alt="User"
              src="/static/images/avatar/1.jpg"
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ ml: 1, display: { xs: "none", md: "block" } }}>
              <Typography variant="body2" color="text.primary">
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrator
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
