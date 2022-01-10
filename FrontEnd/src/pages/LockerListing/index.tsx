import React from 'react'
import { makeStyles } from '@mui/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { borderRadius } from '@mui/system';
import LogoNameSymbol from "../../components/LogoNameSymbol";
import image from '../../assets/AvatarLogo.svg'
import LockListing from '../../components/LockerListing';
import ToggleButtons from '../../components/ToggleButtons';


const LockerListing = () => {
    const classes = useStyles();
    
    const [alignment, setAlignment] = React.useState('all');

    const handleChange = (
      event: React.MouseEvent<HTMLElement>,
      newAlignment: string,
    ) => {
      setAlignment(newAlignment);
    };

    
    return (
        <div className={classes.lockerContainer}>
            <div className={classes.lockerBody}>
                    <div className={classes.lockerTitleContainer}>
                        <div className={classes.lockertitleSectoin}>

                            <div className={classes.lockertitleText}>
                                <span style={{color: "#53C48A"}}>
                                    Locked
                                </span>{" "}
                                <span style={{color: "#363636"}}>
                                    Token Listing
                                </span>
                            </div>
                            
                            <div className={classes.lockerSwtchButtonsContainer}>
                                <ToggleButtons text1='All' text2='My Locks'/>
                            </div>

                        </div>

                        <div className={classes.lockerInputContainer}>
                            Input
                        </div>
                    </div> 
                    
                        <div className={classes.tableHeader}>
                            <div className={classes.tableHeaderElement}>
                                Token
                            </div>
                            <div className={classes.tableHeaderElement}>
                                Amount
                            </div>
                            <div className={classes.tableHeaderElement}>
                                Lock Time
                            </div>
                            <div className={classes.tableHeaderElement}>
                                Unlock Time
                            </div>
                        </div>

                        <div className={classes.tableBody}>

                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />

                        </div>

            
            </div>
        </div>
    )
}

export default LockerListing

const useStyles = makeStyles(() => ({
    lockerContainer: {
        // border: "1px solid red",
        fontFamily: "Roboto Open Sans, sans-serif",

    },
    lockerBody: {
        // border: "1px solid black",
        width: "60%",
        margin: "20px auto",
        background: "#fff",
        "@media (max-width: 900px)": {
            // border: "1px solid red",
            width: "90%",
            margin: "20px auto",

        },   
    },
    lockerTitleContainer: {
        border: "1px solid rbga(0,0,0,0.5)" ,
        // borderColor: ""
        // height: 90,
    },
    lockertitleSectoin: {
        // border: "1px solid black",
        margin: "20px 20px 0px 20px",
        paddingTop: "20px",
        display: "flex",
        justifyContent: "space-between"

    },
    lockertitleText: {
        // border: "1px solid black",
        fontWeight: "bold",
        fontSize: "24px"
        // height: "30px"

    },
    lockerSwtchButtonsContainer: {
        border: "1px solid #1F88FE", 
        height: "25px",
        color: "#7D7D7D"

    },
    lockerSwtchButton: {
        // border: "1px solid black",
        // color: "red"
    },
    lockerInputContainer: {
        // border: "1px solid black",
        // width: "90%",
        margin: "10px 20px 20px 20px",
        padding: "5px 10px",
        backgroundColor: "rgba(126, 126, 126, 0.08 )",
        // opacity: "0.08",
        // color: "black"

        // height: "30px"

    },
    tableHeader: {
        // border: "1px solid black",
        padding: "5px 0px",
        backgroundColor: "rgba(126, 126, 126, 0.08 )",
        display: "flex",
        height: "25px",
        fontSize: "14px"
    },
    tableHeaderElement: {
        // border: "1px solid black",
        width: "20%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start"
    },
    tableBody: {
        // border: "1px solid black"
    },

}));
