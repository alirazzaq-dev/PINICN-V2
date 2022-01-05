import React, { useState, useEffect } from 'react';
import './styles.css';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PICNIClogo from '../../assets/logo.svg'
import Hidden from '@mui/material/Hidden';
import Menu from '@mui/material/Menu';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import {LeftPaneContent} from '../LeftPane';


import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    Link,
    MenuItem,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

import { makeStyles } from '@mui/styles';

import { Link as RouterLink } from "react-router-dom";


type color = "inherit" | "secondary" | "primary" | "success" | "error" | "info" | "warning" | undefined

interface headersButtonsDataType {
    label: string,
    href: string,
    type: color,
    id: number
}

const headersButtonsData: headersButtonsDataType[] = [
    {
        label: "Create",
        href: "/",
        type: "secondary",
        id: 1
    },
    {
        label: "BSC testnet",
        href: "/",
        type: "primary",
        id: 2


    },
    {
        label: "0x0000..000",
        href: "/",
        type: "primary",
        id: 3


    },
];


const useStyles = makeStyles(() => ({
    header: {
        backgroundColor: "#ffffff",
        paddingRight: "50px",
        paddingLeft: "50px",
        boxShadow: 'none',
        border: "1px solid rgba(0, 0, 0, 0.05)",
        "@media (max-width: 900px)": {
            paddingLeft: 0,
            paddingRight: 0,
        },
    },
    menuButton: {
        fontFamily: "Roboto Open Sans, sans-serif",
        fontWeight: 700,
        fontSize: "14px",
        height: "40px",
        width: "150px",
        marginLeft: "20px",
        color: "#ffffff",
        borderRadius: 0,
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
    },
    drawerContainer: {
        padding: "20px 30px",
    },
}));


const Header = () => {

    // const { header, menuButton, toolbar, drawerContainer } = useStyles();

    const [state, setState] = useState({
        mobileView: false,
        drawerOpen: false,
    });
    const { mobileView, drawerOpen } = state;
    
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const setResponsiveness = () => {
            return window.innerWidth < 900
                ? setState((prevState) => ({ ...prevState, mobileView: true }))
                : setState((prevState) => ({ ...prevState, mobileView: false }));
        };

        setResponsiveness();

        window.addEventListener("resize", () => setResponsiveness());

        return () => {
            window.removeEventListener("resize", () => setResponsiveness());
        };
    }, []);

    const displayDesktop = () => {
        return (
            <Toolbar className="toolbar" style={{ border: "0px solid black" }}>
                <div style={{ border: "0px solid black" }}>
                    <Link href="/" style={{textDecoration: "none", cursor: "pointer"}}>
                        <img src={PICNIClogo} alt="LOGO" />
                    </Link>
                </div>
                <div style={{ border: "0px solid black" }}>
                    {getMenuButtons()}
                </div>
            </Toolbar>
        );
    };

    const getMenuButtons = () => {
        return headersButtonsData.map(({ label, href, type }) => {
            return (
                <Button
                    color={type}
                    variant="contained"
                    {...{
                        key: label,
                        to: href,
                        component: RouterLink,
                        className: "menuButton"
                    }}
                >
                    {label}
                </Button>
            );
        });
    };
    
    const displayMobile = () => {
        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => 
           ( setAnchorEl(event.currentTarget))
        const handleClose = () => 
            (setAnchorEl(null))
        const handleDrawerOpen = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: true }));
        const handleDrawerClose = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: false }));

        return (
            <Toolbar style={{ border: "0px solid black", display: "flex", justifyContent: "space-between" }}>

                <div style={{ border: "0px solid black", display: "flex", justifyContent: "space-between", alignSelf: "center", alignItems: "center" }}>

                    <IconButton
                        {...{
                            edge: "start",
                            sx: { color: "black", border: "0px solid black", marginRight: 1 },
                            "aria-label": "menu",
                            "aria-haspopup": "true",
                            onClick: handleDrawerOpen

                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Link href= "/"  sx={{ textDecoration: "none", cursor: "pointer"}}>
                        <img src={PICNIClogo} alt="LOGO" />
                    </Link>

                </div>


                <div style={{ border: "0px solid black", display: "flex", justifyContent: "space-between", alignSelf: "center", alignItems: "center" }}>
                    <IconButton
                        {...{
                            sx: { color: "black", border: "0px solid black", marginRight: 0 },
                            edge: "end",
                            "aria-label": "menu",
                            "aria-haspopup": "true",
                            onClick: handleClick,
                            size: "large"
                        }}
                    >
                        <ArrowCircleDownIcon fontSize="large" />
                    </IconButton>

                    <Button
                        color={headersButtonsData[2].type}
                        variant="contained"
                        className="menuButton"
                    >
                        {headersButtonsData[2].label}
                    </Button>
                </div>

                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={handleClose}> {headersButtonsData[0].label} </MenuItem>
                </Menu>

                <Drawer
                    {...{
                        anchor: "left",
                        open: drawerOpen,
                        onClose: handleDrawerClose,
                    }}
                >
                    <div className="drawerContainer">{LeftPaneContent()}</div>
                </Drawer>

            </Toolbar>
        );
    };

    return (
        <header>
            <AppBar className="header" style={{ border: "0px solid black" }}>
                {mobileView ? displayMobile() : displayDesktop()}
            </AppBar>
        </header>
    );

}

export default Header



