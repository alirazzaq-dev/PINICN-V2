import React from 'react'
import { makeStyles } from '@mui/styles';

const HomeScreen = () => {

    const { container } = useStyles();

    
    return (
        <div className={container} >
            Home Screen
        </div>
    )
}

export default HomeScreen


const useStyles = makeStyles(() => ({
    container: {
        border: "1px solid black"
    }

}));