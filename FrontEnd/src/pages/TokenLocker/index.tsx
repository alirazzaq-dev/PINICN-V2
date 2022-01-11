import React from 'react'
import { makeStyles } from '@mui/styles';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { borderRadius } from '@mui/system';
import LogoNameSymbol from "../../components/LogoNameSymbol";
import image from '../../assets/AvatarLogo.svg'
import LockListing from '../../components/LockerListing';
import ToggleButtons from '../../components/ToggleButtons';
import ButtonComponent from '../../components/Button';



const TokenLocker = () => {

    const classes = useStyles();

    console.log((Date.now()/100).toFixed(0));

    return (
        <div className={classes.lockerContainer}>
            <div className={classes.lockerBody}>
                
                    <div className={classes.lockertitleSectoin}>

                        <div className={classes.lockertitleText}>
                            <span style={{ color: "#53C48A" }}>
                                Lock
                            </span>{" "}
                            <span style={{ color: "#363636" }}>
                                a token
                            </span>
                        </div>

                        <div className={classes.lockerInputs}>
                            <div className={classes.lockerInputContainer}>
                                <input placeholder="Enter token address" className={classes.lockerInput} />
                                <div className={classes.yourBalance} > Your Balance: 0 PICINC</div>
                            </div>

                            <div className={classes.lockerInputContainer}>
                                <input placeholder="Enter token amount to lock" className={classes.lockerInput} />
                                <ButtonComponent text='Max' width='50px' />
                            </div>

                            <div className={classes.lockerInputContainer}>
                                <input type="datetime-local"  value="2014-02-09" className={classes.lockerInput} />
                                <ButtonComponent text='Tomorrow' width='100px'/>
                                <ButtonComponent text='+1 Year' width='100px' />
                            </div>

                        </div>

                        <div>
                            
                            <div className={classes.summaryContainer} >
                                {/* <div style={{border: "0px solid black", margin: "10px 0px"}} > Lock summary </div> */}

                                <div style={{border: "0px solid black", margin: "5px 0px"}} > Token Name: <span> ABC Coin </span> </div>
                                <div style={{border: "0px solid black", margin: "5px 0px"}} > Token Address: <span> 0x000000000000000000000000000000000000 </span> </div>
                                <div style={{border: "0px solid black", margin: "5px 0px"}} > Locker owner: <span> 0x0000001234123435325987502398475983475 </span> </div>
                                <div style={{border: "0px solid black", margin: "5px 0px"}} > Total Supply: <span> 1000000000 </span> </div>
                                <div style={{border: "0px solid black", margin: "5px 0px"}} > Locked amount: <span> 100000 ({100000/1000000000 * 100}%) </span> </div>
                                <div style={{border: "0px solid black", margin: "5px 0px"}} > Lock up Period: <span> 5 years, 3 months </span> </div>

                            </div>

                            <div style={{display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"}}>
                                <ButtonComponent text='Approve Tokens' width='150px' style={{marginRight: "20px"}}/>
                                <ButtonComponent text='Lock Tokens' width='150px' />
                            </div>

                        </div>
                    </div>


            </div>
        </div>
    )
}

export default TokenLocker;


const useStyles = makeStyles(() => ({
    lockerContainer: {
        border: "0px solid red",
        fontFamily: "Roboto Open Sans, sans-serif",

    },
    lockerBody: {
        // border: "1px solid black",
        width: "60%",
        margin: "20px auto",
        background: "#fff",
        border: "1px solid rbga(0,0,0,0.5)",
        "@media (max-width: 900px)": {
            // border: "1px solid red",
            width: "90%",
            margin: "20px auto",
        },
    },
    lockertitleSectoin: {
        margin: "20px 20px 0px 20px",
        paddingTop: "20px",
    },
    lockertitleText: {
        // border: "1px solid black",
        fontWeight: "bold",
        fontSize: "24px"
        // height: "30px"
    },

    lockerInputs: {
        // border: "1px solid black",
        marginTop: "10px",
    },
    lockerInputContainer: {
        border: "0px solid black",
        width: "95%",
        display: "flex",
        margin: "10px auto",
        height: "30px"
    },
    lockerInput: {
        // border: "1px solid black",
        width: "100%",
        borderRadius: 0,
        borderColor: "transparent",
        backgroundColor: "rgba(126, 126, 126, 0.08 )",
    },
    yourBalance: {
        // border: "1px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "10px", color: "#363636",
        backgroundColor: "rgba(126, 126, 126, 0.08 )",
        width: "150px",
        "@media (max-width: 900px)": {
            width: "200px",
        },



    },
    inputButton: {
        // border: "1px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100px"
    },
    summaryContainer: {
        border: "0px solid black", width: "95%",  margin: "5px auto", fontSize: "14px", color: "#363636", display: "none"
    }


}));
