import React, {FC} from 'react'
import { makeStyles } from '@mui/styles';
import LogoNameSymbol from '../LogoNameSymbol';
import Divider from '@mui/material/Divider';


interface LockerListingProps {
    src: string,
    name: string,
    symbol: string,
    amount: number,
    startTime: number,
    endTime: number
}

const LockerListing: FC<LockerListingProps> = ({src, name, symbol, amount, startTime, endTime}) => {

    const classes = useStyles();


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
                {startTime}
            </div>
            <div className={classes.lockerListingElement}>
                {endTime}
            </div>
            <div className={classes.lockerListingElement} style={{justifyContent: "center"}}>
                view
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
