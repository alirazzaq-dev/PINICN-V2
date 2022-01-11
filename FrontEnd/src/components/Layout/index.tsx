import React from 'react'
import Header from '../Header'
import { Outlet } from "react-router-dom";
import LeftPane from '../LeftPane';
import { makeStyles } from '@mui/styles';

import './styles.css';

const Layout = () => {

    const { layoutContainer, layoutBody, layoutLeftpane, outletContainer } = useStyles();


    return (
        <div className={layoutContainer}>
            <div>
                <Header />
            </div>
            <div className={layoutBody}>
                <div className={layoutLeftpane}>
                    <LeftPane />
                </div>
                <div className={outletContainer}>
                    <Outlet />
                </div>
            </div>

        </div>
    )
}

export default Layout;


const useStyles = makeStyles(() => ({
    layoutContainer: {
        height: "100%",
        width: "100%",
        background: "#fbfbfb",
    },
    layoutBody : {
        display: "flex"
    },
    layoutLeftpane : {
        display: "flex",
        width: "20vw",
        height: "100vh",
        "@media (max-width: 1000px)": {
            width: "25vw",
        },
        "@media (max-width: 900px)": {
            display: "none",
        },
    },
    outletContainer: {
        border: "0px solid black", width: "100%", marginTop: "50px"
    }
    
        
}));

