import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Badge,
  Divider,
  Paper
} from '@mui/material';
import Menu from '@mui/icons-material/Menu';
import Dashboard from '@mui/icons-material/Dashboard';
import Assignment from '@mui/icons-material/Assignment';
import Notifications from '@mui/icons-material/Notifications';
import LocalHospital from '@mui/icons-material/LocalHospital';
import Home from '@mui/icons-material/Home';
import People from '@mui/icons-material/People';
import Settings from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'New Complaint', icon: <Assignment />, path: '/complaints/new' },
    { text: 'Patients', icon: <People />, path: '/patients' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#ffffff' }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e1e5e9',
        bgcolor: '#f8f9fa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalHospital sx={{ color: '#5c6bc0', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="700" color="#263238">
              SpectrumCare
            </Typography>
            <Typography variant="caption" color="#78909c">
              Healthcare Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats Panel */}
      <Paper 
        elevation={0}
        sx={{ 
          m: 2, 
          p: 2, 
          bgcolor: '#f5f6fa',
          border: '1px solid #e1e5e9',
          borderRadius: 1
        }}
      >
        <Typography variant="subtitle2" fontWeight="600" color="#546e7a" sx={{ mb: 1 }}>
          System Status
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="#78909c">Active Cases</Typography>
          <Typography variant="caption" fontWeight="600" color="#5c6bc0">12</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="#78909c">Waiting</Typography>
          <Typography variant="caption" fontWeight="600" color="#ff9800">5</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="#78909c">Urgent</Typography>
          <Typography variant="caption" fontWeight="600" color="#f44336">3</Typography>
        </Box>
      </Paper>

      <Divider sx={{ borderColor: '#e1e5e9' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  bgcolor: isActive ? '#f5f6fa' : 'transparent',
                  border: isActive ? '1px solid #e1e5e9' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e1e5e9'
                  },
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isActive ? '#5c6bc0' : '#78909c'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#263238' : '#546e7a',
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e1e5e9',
          color: '#263238'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#546e7a' }}
          >
            <Menu />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: '600',
              color: '#263238'
            }}
          >
            {location.pathname === '/' ? 'Home' :
             location.pathname === '/dashboard' ? 'Dashboard' :
             location.pathname === '/complaints/new' ? 'New Complaint' :
             'System'}
          </Typography>
          
          <IconButton 
            color="inherit" 
            sx={{ color: '#546e7a' }}
          >
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid #e1e5e9'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: location.pathname === '/' ? 'transparent' : '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 