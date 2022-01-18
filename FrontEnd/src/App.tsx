import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import Layout from './components/Layout';
import HomeScreen from './pages/HomeScreen';
import '@fontsource/roboto/700.css';
import Presales from './pages/Presales';
import PresaleForm from './pages/PresaleForm';
import TokenLocker from './pages/TokenLocker';
import LockerListing from './pages/LockerListing';
import LPLocker from './pages/LPLocker';
import LPLockerListing from './pages/LPLockerListing';
import LockerDetail from './pages/LockerDetail';

import { useDispatch, useSelector } from 'react-redux';
import { DataType, addLockerData, setLockerMasterMethods } from './components/Store';
import { ethers } from "ethers";

const LOCKER_FACTORY_ABI = require("./abis/PICNICLockerFactory.json")




function App() {

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const dispatch = useDispatch();
  const { masterContracts } = useSelector((state: DataType) => state);
  console.log("masterContracts", masterContracts)
 
  const fatchBlockChainData = async () => {
    const lotteryContract = new ethers.Contract(masterContracts.lockerFactory, LOCKER_FACTORY_ABI.abi, provider)
    // console.log("masterContracts", lotteryContract)
    dispatch(setLockerMasterMethods(lotteryContract))
  }

  const fetchAllLockers = async () => {
    const lotteryContract = new ethers.Contract(masterContracts.lockerFactory, LOCKER_FACTORY_ABI.abi, provider)
    const LokcersCount = Number(await lotteryContract.lockerCount());
    console.log("New", Number(LokcersCount))
    const lockers = [];
    for(let count = LokcersCount; count > 0; count--){
        const locker = await lotteryContract.loker(count);
        const lockerInfo = {
            id: Number(locker.id),
            type: locker.type,
            lockTime: Number(locker.lockTime),
            lockerAddress:  locker.lockerAddress,
            numOfTokens: Number(locker.numOfTokens),
            owner: locker.owner,
            status: locker.status,
            tokenAddress: locker.tokenAddress,
            unlockTime: Number(locker.unlockTime)
        }
        // console.log(lockerInfo)
        lockers.push(lockerInfo)
    }

    dispatch(addLockerData({count: LokcersCount, lockers: lockers}))

}

  useEffect(() => {
    fatchBlockChainData()
    fetchAllLockers();
  }, [])

  return (
    <Routes>
    <Route path="/" element={<Layout />}>
        <Route path="" element={<HomeScreen />} /> 
        <Route path="PresaleForm" element={<PresaleForm />} /> 
        <Route path="Presales" element={<Presales />} /> 

        <Route path="TokenLocker" element={<TokenLocker />} /> 
        <Route path="LockerListing" >
            <Route path="" element={<LockerListing />} /> 
            <Route path=":lockerID" element={<LockerDetail /> } />
        </Route>       

        <Route path="LPLocker" element={<LPLocker />} /> 
        <Route path="LPLockerListing" >
            <Route path="" element={<LPLockerListing />} /> 
            <Route path=":lockerID" element={<LockerDetail /> } />
        </Route>  

    </Route>       
  </Routes>
  );
}

export default App;
