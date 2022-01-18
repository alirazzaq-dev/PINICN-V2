import React, {useEffect} from 'react'
import { makeStyles } from '@mui/styles';
import image from '../../assets/AvatarLogo.svg'
import LockListing from '../../components/LockerListing';
import ToggleButtons from '../../components/ToggleButtons';
import PaginationComponent from "../../components/Pagination"
import { ethers } from "ethers";
import { useDispatch, useSelector } from 'react-redux';
import {addLockerData, setLockTokenLoading, DataType, setLockTokenInfo} from '../../components/Store'

const LOCKER_FACTORY_ABI = require("../../abis/PICNICLockerFactory.json")


const LockerListing = () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const classes = useStyles();
    const dispatch = useDispatch();
    const { userInfo, lockersData, lockTokenInfo, masterContracts } = useSelector((state: DataType) => state);
    console.log("lockersData", lockersData)


    // const fetchAllLockers = async () => {
    //     const lotteryContract = new ethers.Contract(masterContracts.lockerFactory, LOCKER_FACTORY_ABI.abi, provider)
    //     const LokcersCount = Number(await lotteryContract.lockerCount());
    //     console.log("New", Number(LokcersCount))
    //     const lockers = [];
    //     for(let count = LokcersCount; count > 0; count--){
    //         const locker = await lotteryContract.loker(count);
    //         const lockerInfo = {
    //             id: Number(locker.id),
    //             lockTime: Number(locker.lockTime),
    //             lockerAddress:  locker.lockerAddress,
    //             numOfTokens: Number(locker.numOfTokens),
    //             owner: locker.owner,
    //             status: locker.status,
    //             tokenAddress: locker.tokenAddress,
    //             unlockTime: Number(locker.unlockTime)
    //         }
    //         // console.log(lockerInfo)
    //         lockers.push(lockerInfo)
    //     }

    //     dispatch(addLockerData({count: LokcersCount, lockers: lockers}))

    // }

    // useEffect(()=> {
    //     fetchAllLockers();
    // }, [])


        
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
                                Lock Date
                            </div>
                            <div className={classes.tableHeaderElement}>
                                Unlock Date
                            </div>
                        </div>

                        <div className={classes.tableBody}>

                            {
                                lockersData?.lockers?.map((locker) => {
                                    return (
                                        <LockListing id= {locker.id} name="Ali" symbol='ALIC' src={image} amount={locker.numOfTokens} startTime={locker.lockTime} endTime={locker.unlockTime} />
                                    )
                                })
                            }


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
