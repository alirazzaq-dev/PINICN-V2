import React from 'react'
import { makeStyles } from '@mui/styles';

const HomeScreen = () => {

    const classes = useStyles();

    
    return (
        <div className={classes.container} >
            Home Screen
        </div>
    )
}

export default HomeScreen


const useStyles = makeStyles(() => ({
    container: {
        border: "0px solid black",
        // display: "flex",
        // flexDirection: "row",
        // flexGrow: 3,
    }

}));