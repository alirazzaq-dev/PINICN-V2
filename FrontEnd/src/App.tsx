import React from 'react';
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

function App() {
  return (
    <Routes>
    <Route path="/" element={<Layout />}>
        <Route path="" element={<HomeScreen />} /> 
        <Route path="PresaleForm" element={<PresaleForm />} /> 
        <Route path="Presales" element={<Presales />} /> 

        <Route path="TokenLocker" element={<TokenLocker />} /> 
        <Route path="LockerListing" element={<LockerListing />} /> 
        <Route path="LPLocker" element={<LPLocker />} /> 
        <Route path="LPLockerListing" element={<LPLockerListing />} /> 

    </Route>       
  </Routes>
  );
}

export default App;
