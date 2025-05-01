import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useColorScheme
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Home from '@mui/icons-material/Home';
import MailIcon from '@mui/icons-material/Mail';
import GitHubIcon from '@mui/icons-material/GitHub';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router';
import ConfigQrcode from "./ConfigQrcode";
import CarbonCopy from "./CarbonCopy";
import * as React from "react";

function NavBar() {
    const { gitHubRepository = 'https://github.com/telegram-sms/config-generate' } = {};
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleListItemClick = (path: string) => {
        navigate(path);
        setOpen(false);
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                {["Config", "Carbon Copy Config"].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={() => handleListItemClick(index === 0 ? "/" : "/carbon-copy")}>
                            <ListItemIcon>
                                {index % 2 === 0 ? <Home /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Telegram SMS
                    </Typography>
                    {/* // Add Github Repo to the right side of the AppBar */}
                    <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        href={gitHubRepository}
                        target="_blank"
                        rel="noopener"
                        sx={{ ml: 2 }}
                    >
                        <GitHubIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </>
    );
}


export function App() {
    const { mode, setMode } = useColorScheme();
    if (!mode) {
        return null;
    }
    return(
        <Router>
            <NavBar />
            <Box sx={{ padding: 3 }}>
                <Routes>
                    <Route index element={<ConfigQrcode />} />
                    <Route path="/carbon-copy" element={<CarbonCopy />} />
                    <Route path="/carbon-copy/:id" element={<CarbonCopy />} />
                    <Route path="/cc" element={<Navigate to="/carbon-copy" replace={true}/>} />
                    <Route path="/cc/*" element={<Navigate to="/carbon-copy/" replace={true}/>} />
                    <Route path="*" element={<Navigate to="/" replace={true}/>} />
                </Routes>
            </Box>
        </Router>
    );
}