import { CSSProperties } from "@emotion/serialize";
import { Button } from "@mui/material";
import React, { FC } from "react";

interface ButtonProps {
    text: string;
    width: string;
    style?: CSSProperties;
    onClick?: () => void;
}

const ButtonComponent: FC<ButtonProps> = ({ text, width, style, onClick }) => {
    return (
        <Button
            onClick={onClick}
            sx={{
                ...style,
                borderRadius: 0,
                bgcolor: "#1F88FE",
                color: "#fff",
                fontSize: "10px",
                fontWeight: "200",
                width: width,
                marginLeft: "1px",
                "&:hover": {
                    bgcolor: "#53C48A",
                    color: "#fff",
                    borderColor: "transparent",
                },
            }}
        >
            {text}
        </Button>
    );
};

export default ButtonComponent;
