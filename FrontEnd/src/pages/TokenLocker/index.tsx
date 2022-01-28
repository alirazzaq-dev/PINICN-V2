import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import ToggleButton from "@mui/material/ToggleButton";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { borderRadius } from "@mui/system";
import LogoNameSymbol from "../../components/LogoNameSymbol";
import image from "../../assets/AvatarLogo.svg";
import LockListing from "../../components/LockerListing";
import ToggleButtons from "../../components/ToggleButtons";
import ButtonComponent from "../../components/Button";

import {
    LockTokenInputInfo,
    setLockTokenLoading,
    DataType,
    setLockTokenInfo,
} from "../../components/Store";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import CircularProgress from "@mui/material/CircularProgress";

const TokenLocker = () => {
    const classes = useStyles();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const dispatch = useDispatch();
    const { userInfo, networkDetail, lockTokenInfo, masterContracts } =
        useSelector((state: DataType) => state);
    // console.log("lockTokenInfo ", lockTokenInfo)

    const today = new Date();
    const offset = new Date().getTimezoneOffset() * 60 * 1000;

    const [currentTime, setCurrentTime] = useState<number>(today.getTime());
    const hangleTimeChange = (e: any) => {
        setCurrentTime(new Date(e).getTime());
    };

    const addDay = () => {
        var current = new Date(currentTime);
        // console.log("current before 1 day", current.getTime())
        current.setDate(current.getDate() + 1);
        setCurrentTime(current.getTime());
    };

    const addYear = () => {
        var current = new Date(currentTime);
        // console.log("current before 1 year", current.getTime() )
        current.setFullYear(current.getFullYear() + 1);
        setCurrentTime(current.getTime());
    };

    const [tokens, setTokens] = useState<number>(0);
    const handleTokens = (e: any) => {
        setMax(null);
        setTokens(Number(e));
    };

    const [max, setMax] = useState<number | null>(null);
    const setMaxTokens = () => {
        setMax(Number(lockTokenInfo?.youhold));
        setTokens(Number(lockTokenInfo?.youhold));
    };

    const fetchInputTokenInfo = async (address: any) => {
        if (address === "") {
            dispatch(setLockTokenInfo(null));
            setMax(null);
            return;
        }

        dispatch(setLockTokenInfo(null));
        dispatch(setLockTokenLoading(true));
        // console.log("fethcContractInfo start")
        // console.log(address)

        let res: any;

        try {
            if (networkDetail.id === 56) {
                // console.log("this")
                res = await axios.get(
                    `https://api.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=NP3ZXMF51W5G48FMV9T5GGC1K67YV5UEXC`
                );
            } else if (networkDetail.id === 97) {
                res = await axios.get(
                    `https://api-testnet.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=NP3ZXMF51W5G48FMV9T5GGC1K67YV5UEXC`
                );
            }
        } catch (e) {
            console.log("err");
            // setTokenInfo({ loading: false, error: true })
            throw "Unable to fetch this token data";
        }

        // console.log(res)

        let Contract: any;
        try {
            Contract = new ethers.Contract(
                address,
                JSON.parse(res.data.result),
                provider
            );
        } catch (err) {
            console.log(err);
            throw "Unable to fetch this token data";
        }

        if (!Contract) {
            return;
        }

        const symbol = await Contract.symbol();
        const totalSupply = await Contract.totalSupply();
        const decimals = await Contract.decimals();
        const balanceOf = await Contract.balanceOf(userInfo.userAddress);
        const name = await Contract.name();
        const allowance = await Contract.allowance(
            userInfo.userAddress,
            masterContracts.lockerFactory
        );

        const lockTokenInfo: LockTokenInputInfo = {
            loading: false,
            address: address,
            methods: Contract,
            name: String(name),
            symbol: String(symbol),
            decimal: Number(decimals),
            totalSupply: Number(totalSupply),
            youhold: Number(balanceOf),
            allowance: Number(allowance),
        };

        // console.log("lockTokenInfo", lockTokenInfo)

        dispatch(setLockTokenInfo(lockTokenInfo));
    };

    const handleApprove = async () => {
        console.log("approval tokens ", tokens);

        const allowance = await lockTokenInfo.methods.allowance(
            userInfo.userAddress,
            masterContracts.lockerFactory
        );
        console.log("allowance ", Number(allowance));
        if (Number(allowance) >= tokens) {
            alert("Successfully Approved");
        } else {
            try {
                const signer = provider.getSigner();
                const approvalTx = lockTokenInfo.methods.connect(signer);

                await approvalTx.approve(masterContracts.lockerFactory, tokens);
            } catch (e) {
                alert(e);
            }
        }
    };

    const handleLock = async () => {
        console.log("Tokens to lock ", tokens);
        const timeRequiered = ((currentTime - offset) / 1000).toFixed();
        console.log("Locked till  ", timeRequiered);

        const fees = await masterContracts.lockerFactoryMethods.lockFee();
        console.log("fees ", Number(fees));

        const signer = provider.getSigner();
        const lockTx = masterContracts.lockerFactoryMethods.connect(signer);
        const options = { value: fees };

        try {
            const tx = await lockTx.createLcoker(
                0,
                lockTokenInfo.address,
                tokens,
                timeRequiered,
                options
            );
            let receipt = await tx.wait();
            console.log(receipt);
        } catch (e) {
            alert(e);
        }
    };

    return (
        <div className={classes.lockerContainer}>
            <div className={classes.lockerBody}>
                <div className={classes.lockertitleSectoin}>
                    <div className={classes.lockertitleText}>
                        <span style={{ color: "#53C48A" }}>Lock</span>{" "}
                        <span style={{ color: "#363636" }}>a token</span>
                    </div>

                    <div className={classes.lockerInputs}>
                        <div className={classes.lockerInputContainer}>
                            <input
                                type="text"
                                onChange={(e) =>
                                    fetchInputTokenInfo(e.target.value)
                                }
                                placeholder="Enter token address"
                                className={classes.lockerInput}
                            />

                            {lockTokenInfo?.symbol ? (
                                <div className={classes.yourBalance}>
                                    {" "}
                                    Balance: {lockTokenInfo?.youhold}{" "}
                                    {lockTokenInfo?.symbol}
                                </div>
                            ) : lockTokenInfo?.loading ? (
                                <div className={classes.yourBalance}>
                                    {" "}
                                    <CircularProgress size={25} />{" "}
                                </div>
                            ) : null}
                        </div>

                        <div className={classes.lockerInputContainer}>
                            <input
                                type="number"
                                value={max && max > 0 ? max : tokens}
                                placeholder="Enter token amount to lock"
                                onChange={(e) => handleTokens(e.target.value)}
                                className={classes.lockerInput}
                            />
                            <ButtonComponent
                                text="Max"
                                width="50px"
                                onClick={setMaxTokens}
                            />
                        </div>

                        <div className={classes.lockerInputContainer}>
                            <input
                                onChange={(e) =>
                                    hangleTimeChange(e.target.value)
                                }
                                type="datetime-local"
                                data-date-format="DD-YYYY-MM"
                                value={new Date(currentTime - offset)
                                    .toISOString()
                                    .slice(0, 19)}
                                min={new Date(today).toISOString().slice(0, 19)}
                                className={classes.lockerInput}
                            />
                            <ButtonComponent
                                text="+1 Day"
                                width="100px"
                                onClick={addDay}
                            />
                            <ButtonComponent
                                text="+1 Year"
                                width="100px"
                                onClick={addYear}
                            />
                        </div>
                    </div>

                    <div>
                        <div className={classes.summaryContainer}>
                            {/* <div style={{border: "0px solid black", margin: "10px 0px"}} > Lock summary </div> */}

                            <div
                                style={{
                                    border: "0px solid black",
                                    margin: "5px 0px",
                                }}
                            >
                                {" "}
                                Token Name: <span> ABC Coin </span>{" "}
                            </div>
                            <div
                                style={{
                                    border: "0px solid black",
                                    margin: "5px 0px",
                                }}
                            >
                                {" "}
                                Token Address:{" "}
                                <span>
                                    {" "}
                                    0x000000000000000000000000000000000000{" "}
                                </span>{" "}
                            </div>
                            <div
                                style={{
                                    border: "0px solid black",
                                    margin: "5px 0px",
                                }}
                            >
                                {" "}
                                Locker owner:{" "}
                                <span>
                                    {" "}
                                    0x0000001234123435325987502398475983475{" "}
                                </span>{" "}
                            </div>
                            <div
                                style={{
                                    border: "0px solid black",
                                    margin: "5px 0px",
                                }}
                            >
                                {" "}
                                Total Supply: <span> 1000000000 </span>{" "}
                            </div>
                            <div
                                style={{
                                    border: "0px solid black",
                                    margin: "5px 0px",
                                }}
                            >
                                {" "}
                                Locked amount:{" "}
                                <span>
                                    {" "}
                                    100000 ({(100000 / 1000000000) * 100}%){" "}
                                </span>{" "}
                            </div>
                            <div
                                style={{
                                    border: "0px solid black",
                                    margin: "5px 0px",
                                }}
                            >
                                {" "}
                                Lock up Period: <span>
                                    {" "}
                                    5 years, 3 months{" "}
                                </span>{" "}
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "20px",
                            }}
                        >
                            <ButtonComponent
                                onClick={handleApprove}
                                text={`Approve ${
                                    tokens > 0 ? tokens : ""
                                } Tokens`}
                                width="150px"
                                style={{ marginRight: "20px" }}
                            />
                            <ButtonComponent
                                onClick={handleLock}
                                text="Lock Tokens"
                                width="150px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        fontSize: "24px",
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
        height: "30px",
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
        fontSize: "10px",
        color: "#363636",
        backgroundColor: "rgba(126, 126, 126, 0.08 )",
        width: "150px",
        "@media (max-width: 900px)": {
            width: "150px",
        },
    },
    inputButton: {
        // border: "1px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100px",
    },
    summaryContainer: {
        border: "0px solid black",
        width: "95%",
        margin: "5px auto",
        fontSize: "14px",
        color: "#363636",
        display: "none",
    },
}));
