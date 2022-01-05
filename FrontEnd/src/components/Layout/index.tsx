import React from 'react'
import Header from '../Header'
import { Outlet } from "react-router-dom";
import LeftPane from '../LeftPane';
import './styles.css';

const Layout = () => {
    return (
        <div className='Layout-container'>
            <Header />
            <div className='Layout-body'>
                <div className='Layout-Leftpane'>
                    <LeftPane />
                </div>
                <div style={{border: "1px solid black", width: "100%", marginTop: "70px"}}>
                    <Outlet />
                </div>
            </div>

        </div>
    )
}

export default Layout
