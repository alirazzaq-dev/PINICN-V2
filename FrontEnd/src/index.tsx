import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core'
import store from './components/Store/store'
import { Provider } from 'react-redux';

const config: Config = {
  // readOnlyChainId: Mainnet.chainId,
  // readOnlyUrls: {
  //   [Mainnet.chainId]: 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  // },
}


const theme = createTheme({
  palette: {
    primary: {
      main: "#1F88FE",
    },
    secondary: {
      main: "#53C48A",
    },
  },
});


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DAppProvider config={config}>
            <App />
          </DAppProvider>
        </ThemeProvider>
      </Provider>

    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
