import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
// import './styles.css';
import Button from "@mui/material/Button";
// import Grid from '@mui/material/Grid';
import PICNIClogo from "../../assets/logo.svg";
// import Hidden from '@mui/material/Hidden';
// import Menu from '@mui/material/Menu';
// import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { LeftPaneContent } from "../LeftPane";
import { useDispatch, useSelector } from "react-redux";
import { DataType, setActiveUser, setNetworkDetails } from "../Store";

import MenuIcon from "@mui/icons-material/Menu";
import { useEthers, shortenIfAddress, getChainName } from "@usedapp/core";
import { ethers } from "ethers";

import {
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    Link,
    MenuItem,
} from "@mui/material";

type color =
    | "inherit"
    | "secondary"
    | "primary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | undefined;

interface headersButtonsDataType {
    label: string;
    href: string;
    type: color;
    id: number;
}

const Header = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const { userInfo, networkDetail } = useSelector((state: DataType) => state);
    // console.log("userInfo", userInfo)
    // console.log("networkDetail", networkDetail)

    const [walletConnect, setWalletConnect] = useState(false);
    const { account, activateBrowserWallet, deactivate } = useEthers();
    const isConnected = account !== undefined;
    console.log("account ", account);

    useEffect(() => {
        if (isConnected) {
            connectWallet();
        }
    }, [isConnected]);

    const connectWallet = async () => {
        if (account) {
            dispatch(setActiveUser(account));
        }

        const network = await provider.getNetwork();
        // if (Number(network.chainId) !== 56) {
        //     alert("Please connect to Binance Smart Chain Mainnetwork to use this Dapp")
        // }
        dispatch(
            setNetworkDetails({
                id: Number(network.chainId),
                chain: getChainName(Number(network.chainId)),
            })
        );
    };

    let headersButtonsData: headersButtonsDataType[] = [
        {
            label: "Create",
            href: "/",
            type: "secondary",
            id: 1,
        },
        {
            label: networkDetail.chain ? networkDetail.chain : "",
            href: "/",
            type: "primary",
            id: 2,
        },
        {
            label: account ? shortenIfAddress(account) : "",
            href: "/",
            type: "primary",
            id: 3,
        },
    ];

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
                : setState((prevState) => ({
                      ...prevState,
                      mobileView: false,
                  }));
        };

        setResponsiveness();

        window.addEventListener("resize", () => setResponsiveness());

        return () => {
            window.removeEventListener("resize", () => setResponsiveness());
        };
    }, []);

    const displayDesktop = () => {
        return (
            <Toolbar className={classes.toolbar}>
                <div>
                    <Link href="/" className={classes.logo}>
                        <img src={PICNIClogo} alt="LOGO" />
                    </Link>
                </div>
                <div>{getMenuButtons()}</div>
            </Toolbar>
        );
    };

    const getMenuButtons = () => {
        if (!isConnected) {
            return (
                <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => activateBrowserWallet()}
                    sx={{
                        fontFamily: "Roboto Open Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "12px",
                        height: "35px",
                        width: "150px",
                        marginLeft: "20px",
                        color: "#ffffff",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    Connect Wallet
                </Button>
            );
        } else {
            return headersButtonsData.map(({ label, href, type }, key) => {
                return (
                    <Button
                        key={key}
                        color={type}
                        variant="contained"
                        sx={{
                            fontFamily: "Roboto Open Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
                            height: "35px",
                            width: "120px",
                            marginLeft: "20px",
                            color: "#ffffff",
                            borderRadius: 0,
                        }}
                    >
                        {label}
                    </Button>
                );
            });
        }
    };

    const displayMobile = () => {
        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
            setAnchorEl(event.currentTarget);
        const handleClose = () => setAnchorEl(null);
        const handleDrawerOpen = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: true }));
        const handleDrawerClose = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: false }));

        return (
            <Toolbar className={classes.toolbar}>
                <div className={classes.toolbarLeftSection}>
                    <IconButton
                        {...{
                            edge: "start",
                            sx: {
                                color: "black",
                                border: "0px solid black",
                                marginRight: 1,
                            },
                            "aria-label": "menu",
                            "aria-haspopup": "true",
                            onClick: handleDrawerOpen,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Link href="/" className={classes.logo}>
                        <img src={PICNIClogo} alt="LOGO" />
                    </Link>
                </div>

                {!walletConnect && (
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => setWalletConnect(true)}
                        sx={{
                            fontFamily: "Roboto Open Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
                            height: "35px",
                            width: "150px",
                            marginLeft: "20px",
                            color: "#ffffff",
                            borderRadius: 0,
                        }}
                    >
                        Connect Wallet
                    </Button>
                )}

                {walletConnect && (
                    <Button
                        color={headersButtonsData[2].type}
                        variant="contained"
                        sx={{
                            fontFamily: "Roboto Open Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
                            height: "35px",
                            width: "120px",
                            marginLeft: "20px",
                            color: "#ffffff",
                            borderRadius: 0,
                        }}
                    >
                        {headersButtonsData[2].label}
                    </Button>
                )}

                <Drawer
                    {...{
                        anchor: "left",
                        open: drawerOpen,
                        onClose: handleDrawerClose,
                        style: {
                            // border: "1px solid black",
                            // backgroundColor: "red"
                        },
                    }}
                >
                    <div className={classes.drawerContainer}>
                        {LeftPaneContent()}
                    </div>
                </Drawer>
            </Toolbar>
        );
    };

    return (
        <header>
            <AppBar
                sx={{
                    backgroundColor: "#ffffff",
                    paddingRight: "20px",
                    paddingLeft: "20px",
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    "@media (max-width: 900px)": {
                        paddingLeft: 0,
                        paddingRight: 0,
                    },
                }}
            >
                {mobileView ? displayMobile() : displayDesktop()}
            </AppBar>
            //{" "}
        </header>
    );
};

export default Header;

const useStyles = makeStyles(() => ({
    header: {
        backgroundColor: "#ffffff",
        paddingRight: "20px",
        paddingLeft: "20px",
        boxShadow: "none",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        fontFamily: "Roboto Open Sans, sans-serif",

        "@media (max-width: 900px)": {
            paddingLeft: 0,
            paddingRight: 0,
        },
    },
    logo: {
        border: "0px solid blue",
        textDecoration: "none",
        cursor: "pointer",
        // height: "100%",
    },
    menuButton: {
        border: "0px solid blue",
        fontWeight: 700,
        fontSize: "14px",
        height: "40px",
        width: "150px",
        marginLeft: "20px",
        color: "#ffffff",
        borderRadius: 0,
    },
    toolbar: {
        border: "0px solid black",
        display: "flex",
        justifyContent: "space-between",
    },
    toolbarLeftSection: {
        border: "0px solid black",
        display: "flex",
        justifyContent: "space-between",
        alignSelf: "center",
        alignItems: "center",
    },
    drawerContainer: {
        width: "300px",
        // padding: "10px",
        // backgroundColor: "red"
    },
}));
