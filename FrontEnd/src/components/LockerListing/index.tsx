import React, {FC} from 'react'
import { makeStyles } from '@mui/styles';
import LogoNameSymbol from '../LogoNameSymbol';
import Divider from '@mui/material/Divider';
import { Link } from "@mui/material";


interface LockerListingProps {
    id: number,
    src: string,
    name: string,
    symbol: string,
    amount: number,
    startTime: number,
    endTime: number
}

const LockerListing: FC<LockerListingProps> = ({id, src, name, symbol, amount, startTime, endTime}) => {

    const classes = useStyles();

    console.log("startTime", new Date(startTime * 1000).toLocaleDateString("en-US")    )

    const startingTime = new Date(startTime * 1000).toLocaleDateString("en-US");
    const EndingTime = new Date(endTime * 1000).toLocaleDateString("en-US");


    return (       
        <div className={classes.lockerListing}>
            <div className={classes.lockerListingElement}>
                <div className={classes.lockerListingLogo} >
                    <LogoNameSymbol name={name} symbol={symbol} src={src} logoHeight={30}/>
                </div>
            </div>
            <div className={classes.lockerListingElement}>
                {amount}
            </div>
            <div className={classes.lockerListingElement}>
                {startingTime}
            </div>
            <div className={classes.lockerListingElement}>
                {EndingTime}
            </div>
            <div className={classes.lockerListingElement} style={{justifyContent: "center"}}>
                <Link href={`LockerListing/${id}`} style={{ textDecoration: "none", cursor: "pointer" }}>
                    view
                </Link>
            </div>
    </div>
)
}

export default LockerListing



const useStyles = makeStyles(() => ({
    lockerListing: {
        borderBottom: "1px solid #F2F2F2",
        // borderWidth: "1px 2px 3px 4px",
        display: "flex",
        height: "50px",
        
    },
    lockerListingElement: {
        // border: "1px solid black",
        width: "20%",
        display: "flex",
        alignItems: "center",
        marginLeft: "0px",
        "@media (max-width: 900px)": {
            // width: "100%",
            marginLeft: "0px"

        },   
    },
    lockerListingLogo: {
        width: "60%",
        "@media (max-width: 900px)": {
            width: "100%",
            marginLeft: "0px"

        },   
    }

}));
