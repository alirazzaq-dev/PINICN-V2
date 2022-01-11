import React from 'react'
import { makeStyles } from '@mui/styles';
import image from '../../assets/AvatarLogo.svg'
import LockListing from '../../components/LockerListing';
import ToggleButtons from '../../components/ToggleButtons';
import PaginationComponent from "../../components/Pagination"


const LockerListing = () => {
    
    const classes = useStyles();
        
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
                            <input placeholder="Search by token address" className={classes.lockerInput} />
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
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />
                            <LockListing name="Ali" symbol='ALIC' src={image} amount={1000} startTime={51351} endTime={11111} />

                        </div>

                        <div className={classes.paginationContainer}>
                            <PaginationComponent count={7} />
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
        border: "0px solid black",
        width: "90%",
        display: "flex",
        margin: "10px auto 20px auto",
        height: "30px"
    },
    lockerInput: {
        // border: "1px solid black",
        width: "100%",
        borderRadius: 0,
        borderColor: "transparent",
        backgroundColor: "rgba(126, 126, 126, 0.08 )",
        // padding: "5px 10px",
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
    },
    paginationContainer: {
        // border: "1px solid black",
        marginTop: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    pagination: {
        // border: "1px solid black",

    }

}));
