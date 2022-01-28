import React, { FC } from "react";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import AvatarLogo from "../../assets/AvatarLogo.svg";
import Avatar from "@mui/material/Avatar";

interface LogoNameSymbolProps {
    src: string;
    name: string;
    symbol: string;
    logoHeight?: number;
}

const LogoNameSymbol: FC<LogoNameSymbolProps> = ({
    src,
    name,
    symbol,
    logoHeight = 30,
}) => {
    const classes = useStyles();

    return (
        <div className={classes.rootContainer} style={{}}>
            <div className={classes.avatarContainer} style={{}}>
                <Avatar
                    src={src}
                    alt="Coin Logo"
                    sx={{
                        border: "0px solid black",
                        width: logoHeight,
                        height: logoHeight,
                        bgcolor: "#F5F5F5",
                    }}
                />
            </div>

            <div
                style={{
                    border: "0px solid black",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div style={{ border: "0px solid black" }}>
                    <div
                        style={{
                            border: "0px solid black",
                            fontSize: "14px",
                            fontWeight: "550",
                            color: "#363636",
                        }}
                    >
                        {name}
                    </div>
                    <div
                        style={{
                            border: "0px solid black",
                            fontSize: "12px",
                            color: "#CCCCCC",
                        }}
                    >
                        {symbol.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoNameSymbol;

const useStyles = makeStyles(() => ({
    rootContainer: {
        border: "0px solid black",
        display: "flex",
        width: "100%",
    },
    avatarContainer: {
        border: "0px solid black",
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "@media (max-width: 900px)": {
            // width: "100%"
        },
    },
}));
