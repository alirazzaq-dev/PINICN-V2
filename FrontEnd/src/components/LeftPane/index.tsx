import React from 'react'
import './styles.css';
// import { makeStyles } from '@mui/styles';
import productSVG from "../../assets/product.svg"
import RemoveIcon from '@mui/icons-material/Remove';
import './styles.css'
import { Link } from "@mui/material";

export const LeftPaneContent = () => {

    const Icon = () => (
        <RemoveIcon  />
    )

    return (
        <div className="paneContainer">

            <div className="mainHeadingContainer"> 
                <img src={productSVG} alt="Products" />
                <span className="mainHeadingText">
                    Products 
                </span>
             </div>
            
            <div className="productDetailContainer">
                <div className="productHeading"> <Icon /> PICNIC LaunchPad </div>
                

                <div className="productSubheadingText"> 
                    <Link href="/PresaleForm" style={{textDecoration: "none", cursor: "pointer", color: "black"}}>
                        Create a presale 
                    </Link>
                </div>
                <div className="productSubheadingText"> 
                    <Link href="/Presales" style={{textDecoration: "none", cursor: "pointer", color: "black"}}>
                        Presale listings 
                    </Link>
                </div>
            </div>

            <div className="productDetailContainer">
                <div className="productHeading"> <Icon /> PICNIC Locker </div>
                <div className="productSubheadingText"> 
                    <Link href="/TokenLocker" style={{textDecoration: "none", cursor: "pointer", color: "black"}}>
                        Token Locker 
                    </Link>
                     
                </div>
                <div className="productSubheadingText"> 
                    <Link href="/LockerListing" style={{textDecoration: "none", cursor: "pointer", color: "black"}}>
                        Locked Tokens Listings 
                    </Link>
                </div>
            </div>

            <div className="productDetailContainer">
                <div className="productHeading"> <Icon /> PICNIC LP Locker </div>
                <div className="productSubheadingText"> 
                    <Link href="/LPLocker" style={{textDecoration: "none", cursor: "pointer", color: "black"}}>
                        LP Toker
                    </Link>
                </div>
                <div className="productSubheadingText"> 
                    <Link href="/LPLockerListing" style={{textDecoration: "none", cursor: "pointer", color: "black"}}>
                        Locked LP Listings 
                    </Link>
                 </div>
            </div>

        </div>
    )

}


const LeftPane = () => {
    return (
        <div className='LeftPane-container'>
            {LeftPaneContent()}
        </div>
    )
}

export default LeftPane

