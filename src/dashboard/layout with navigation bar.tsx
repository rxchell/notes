import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import BarChartIcon from '@mui/icons-material/BarChart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { AppBar, Button, IconButton } from '@mui/material';
import { match } from 'path-to-regexp';
import { To, useNavigate } from 'react-router-dom';
import { AccountCircle } from '@mui/icons-material';
import LogOutComponent from '../UserAuthentication/LogOutComponent'; // Import the LogOutComponent
import SnackbarComponent from './DisplayComponent';
import HistoryIcon from '@mui/icons-material/History';

const drawerWidth = 240;

interface LayoutProps {
    children?: React.ReactNode; // define children as prop
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [currenPath, setCurrenPath] = useState('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    let navigate = useNavigate();

    //get current URL
    useEffect(() => {
        setCurrenPath(window.location.pathname)
    }, [window.location.pathname]);

    const sideBarProp = [{
        text: 'Overview',
        path: ['/overview', '/'],
        icon: <GridViewIcon />
    }, {
        text: 'Search',
        path: ['/search'],
        icon: <SearchIcon />
    }, {
        text: 'Real-time Data',
        path: ['/realtime'],
        icon: <BarChartIcon />
    }, {
        text: 'Historical Data',
        path: ['/historical'],
        icon: <HistoryIcon />
    }, {
        text: 'Forecast Analytics',
        path: ['/forecast'],
        icon: <QueryStatsIcon />
    },]

    const sideBarClick = (path: To) => {
        navigate(path)
    }

    //judge which path is active
    const isPathActive = (activePaths: any[], currentPath: any) => {
        return activePaths.some(path => {
            let matchFn
            if (path == '/')
                matchFn = match(path, { end: true })
            else
                matchFn = match(path, { end: false })
            return !!matchFn(currentPath);
        });
    };

    const menuId = 'primary-search-account-menu';
    const handleProfileMenuOpen = () => {
        // Navigate to the user profile page
        navigate('/userprofile');
    };

    const [logOutFailed, setLogOutFailed] = useState(false);
    const [logOutSuccess, setLogOutSuccess] = useState(false);

    return (
        <Box sx={{ display: 'flex', height: '100%' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor:'white' }}>
                <Toolbar>
                    <Box
                        component="img"
                        src="/images/logo.png"
                        alt="Logo"
                        sx={{ height: 50, marginRight: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex' }}>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="primary" // Set a different color here
                        >
                            <AccountCircle />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {/* Left SideBar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {sideBarProp.map((prop, index) => (
                            <ListItem key={prop.text} disablePadding>
                                <ListItemButton onClick={() => sideBarClick(prop.path[0])} sx={{
                                    marginTop: 2,
                                    marginLeft: 3,
                                    borderRadius: '0.5rem 0 0 0.5rem',
                                    bgcolor: isPathActive(prop.path, currenPath) ? 'rgb(27, 41, 102)' : 'inherit',
                                    color: isPathActive(prop.path, currenPath) ? 'white' : 'inherit',
                                    '&:hover': {
                                        bgcolor: isPathActive(prop.path, currenPath) ? 'rgba(27, 41, 102,0.75)' : 'rgba(27, 41, 102,0.2)',
                                        color: isPathActive(prop.path, currenPath) ? 'white' : 'inherit',
                                    },
                                }}>
                                    <ListItemIcon sx={{ color: isPathActive(prop.path, currenPath) ? 'white' : 'inherit', }}>{prop.icon}</ListItemIcon>
                                    <ListItemText primary={prop.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <div className="blank_space" style={{ flexGrow: 1 }}></div>
                {/* Render the LogOutComponent */}
                <LogOutComponent
                    onLogoutSuccess={() => setLogOutSuccess(true)} // Pass a callback to handle logout success
                    onLogoutFailure={() => setLogOutFailed(true)} // Pass a callback to handle logout failure
                />
            </Drawer>
            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: 8 }}>{children}</Box>
            {/* Snackbar to display logout failure */}
            <SnackbarComponent
                message="Logout Fail"
                open={logOutFailed}
                onClose={() => setLogOutFailed(false)}
                severity="error"
            />
            {/* Snackbar to display logout success */}
            <SnackbarComponent
                message="Logout Success"
                open={logOutSuccess}
                onClose={() => setLogOutSuccess(false)}
                severity="success"
            />
        </Box>
    );
}

export default Layout
