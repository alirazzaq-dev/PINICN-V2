import React, { useState } from "react";
import { useParams } from "react-router-dom";

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

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Countdown from "react-countdown";

const ButtonComp = ({ text }: { text: string }) => {
    return (
        <Button
            variant="contained"
            sx={{
                border: 0,
                fontSize: "8px",
                borderRadius: 0,
                bgcolor: "#53C48A",
                "&:hover": {
                    bgcolor: "#53C48A",
                    color: "#fff",
                },
            }}
        >
            {text}
        </Button>
    );
};

const LockerDetail = () => {
    let params = useParams();
    console.log("params", params);

    const classes = useStyles();

    const ListInfo = ({ key }: { key: string }) => {
        return (
            <div
                style={{
                    border: "1px solid black",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                }}
            >
                <div style={{ color: "#363636" }}> {key} </div>
                <div style={{ color: "#7D7D7D" }}> {"value"} </div>
            </div>
        );
    };

    const [isOwner, setIsOwner] = useState(true);
    console.log("isOwner ", isOwner);
    const handleOwnerView = () => {
        setIsOwner(!isOwner);
    };

    // Renderer callback with condition
    const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
        if (completed) {
            // Render a completed state
            return <div> Unlocked </div>;
        } else {
            // Render a countdown
            return (
                <span>
                    {days}:{hours}:{minutes}:{seconds}
                </span>
            );
        }
    };

    return (
        <div className={classes.lockerContainer}>
            <div className={classes.lockerBody1}>
                <div className={classes.lockertitleSectoin1}>
                    <div className={classes.lockertitleText}>
                        <div
                            style={{
                                border: "0px solid black",
                                fontWeight: "bold",
                            }}
                        >
                            <span style={{ color: "#363636" }}>Lock </span>
                            <span style={{ color: "#53C48A" }}>Info</span>
                        </div>

                        <div style={{ border: "0px solid black" }}>
                            <Countdown
                                date={1737080790000}
                                renderer={renderer}
                            />
                        </div>

                        <div style={{ border: "0px solid black" }}>
                            {/* <ToggleButtons text1='visitor' text2='owner' /> */}
                            <FormControlLabel
                                onChange={handleOwnerView}
                                control={<Switch defaultChecked />}
                                label="Owner View"
                            />
                        </div>
                    </div>

                    <div style={{ border: "0px solid black" }}>
                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}>
                                {" "}
                                Total Amount Locked{" "}
                            </div>
                            <div style={{ color: "#7D7D7D" }}>
                                {" "}
                                2 000.00 $PIC{" "}
                            </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}>
                                {" "}
                                Total Values Locked{" "}
                            </div>
                            <div style={{ color: "#7D7D7D" }}> $0 </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}>
                                {" "}
                                Lockup Date{" "}
                            </div>
                            <div style={{ color: "#7D7D7D" }}>
                                {" "}
                                25-11-2025 11 00 UTC
                            </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}>
                                {" "}
                                Token Address{" "}
                            </div>
                            <div style={{ color: "#1F88FE" }}>
                                {" "}
                                0xECB972692dceFc51e9B45e096C7A0b1411019e9b{" "}
                            </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}> Token Name </div>
                            <div style={{ color: "#7D7D7D" }}> PICNIC </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}>
                                {" "}
                                Token Symbol{" "}
                            </div>
                            <div style={{ color: "#7D7D7D" }}> $PIC </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}>
                                {" "}
                                Token Decimals{" "}
                            </div>
                            <div style={{ color: "#7D7D7D" }}> 9 </div>
                        </div>

                        <div className={classes.infoElement}>
                            <div style={{ color: "#363636" }}> Owner </div>
                            <div style={{ color: "#1F88FE" }}>
                                {" "}
                                0xECB972692dceFc51e9B45e096C7A0b1411019e9b{" "}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className={classes.lockerBody2}>
                    <div className={classes.lockertitleSectoin2}>
                        <div
                            className={classes.lockertitleSectoin2subContainer}
                        >
                            <div className={classes.lockertitleSectoin2Title}>
                                {" "}
                                Withdraw{" "}
                            </div>
                            <div
                                className={
                                    classes.lockertitleSectoin2InputContainer
                                }
                            >
                                <input
                                    type="number"
                                    defaultValue={0}
                                    className={classes.lockertitleSectoin2Input}
                                />
                            </div>
                            <div className={classes.lockertitleSectoin2Button}>
                                <ButtonComp text="Withdraw" />
                            </div>
                        </div>
                    </div>

                    <div className={classes.lockertitleSectoin2}>
                        <div
                            className={classes.lockertitleSectoin2subContainer}
                        >
                            <div className={classes.lockertitleSectoin2Title}>
                                {" "}
                                Add Amount{" "}
                            </div>
                            <div
                                className={
                                    classes.lockertitleSectoin2InputContainer
                                }
                            >
                                <input
                                    type="number"
                                    defaultValue={0}
                                    className={classes.lockertitleSectoin2Input}
                                />
                            </div>
                            <div className={classes.lockertitleSectoin2Button}>
                                <ButtonComp text="Add" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LockerDetail;

const useStyles = makeStyles(() => ({
    lockerContainer: {
        border: "0px solid red",
        fontFamily: "Roboto Open Sans, sans-serif",
        background: "#fbfbfb",
    },
    lockerBody1: {
        // border: "1px solid black",
        width: "60%",
        margin: "20px auto",
        border: "1px solid rbga(0,0,0,0.5)",
        background: "#fff",
        "@media (max-width: 900px)": {
            // border: "1px solid red",
            width: "95%",
            margin: "10px auto",
        },
    },
    lockertitleSectoin1: {
        padding: "10px 0px 10px 0px ",
        margin: "20px 20px 0px 20px",
    },
    lockertitleText: {
        // border: "1px solid black",
        fontSize: "24px",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
    },

    infoElement: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "16px",
        fontWeight: 500,
        borderBottom: "1px solid #F2F2F2",
        margin: "5px 0px",
        paddingBottom: "5px",
    },

    lockerBody2: {
        // border: "1px solid black",
        width: "60%",
        margin: "20px auto",
        // height: "100px",
        // border: "1px solid rbga(0,0,0,0.5)",
        display: "flex",
        justifyContent: "space-between",
        "@media (max-width: 900px)": {
            // border: "1px solid red",
            width: "95%",
            margin: "10px auto",
        },
    },
    lockertitleSectoin2: {
        // border: "1px solid red",
        background: "#fff",
        padding: "20px 0px 20px 0px",
        width: "48%",
    },
    lockertitleSectoin2subContainer: {
        // border: "1px solid red",
        margin: "0px 20px",
    },
    lockertitleSectoin2Title: {
        // border: "1px solid red",
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "5px",
        color: "#363636",
    },
    lockertitleSectoin2InputContainer: {
        border: "1px solid #F2F2F2",
        marginBottom: "5px",
    },
    lockertitleSectoin2Input: {
        // border: "1px solid red",
        width: "95%",
        height: "16px",
        fontSize: "16px",
        padding: "5px",
        color: "#CCCCCC",
        background: "#fbfbfb",
        border: 0,
        borderRadius: 0,
    },
    lockertitleSectoin2Button: {
        // border: "1px solid red",
        display: "flex",
        justifyContent: "center",
        marginTop: "10px",
    },
    lockerBody3: {
        border: "1px solid red",
        width: "60%",
        margin: "20px auto",
        // border: "1px solid rbga(0,0,0,0.5)",
        background: "#fff",
        "@media (max-width: 900px)": {
            // border: "1px solid red",
            width: "95%",
            margin: "10px auto",
        },
    },
}));
