import React from 'react'
import { useParams } from "react-router-dom"; 


const LockerDetail = () => {
   
    let params = useParams();
    console.log("params", params)

    return (
        <div>
            LockerDetail
        </div>
    )
}

export default LockerDetail
