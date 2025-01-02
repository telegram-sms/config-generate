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
    ListItemText
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Home from '@mui/icons-material/Home';
import MailIcon from '@mui/icons-material/Mail';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import ConfigQrcode from "./ConfigQrcode";
import CarbonCopy from "./CarbonCopy";
import * as React from "react";

function NavBar() {
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
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </>
    );
}

export function App() {
    return (
        <Router>
            <NavBar />
            <Box sx={{ padding: 3 }}>
                <Routes>
                    <Route path="/" element={<ConfigQrcode />} />
                    <Route path="/carbon-copy" element={<CarbonCopy />} />
                </Routes>
            </Box>
        </Router>
    );
}