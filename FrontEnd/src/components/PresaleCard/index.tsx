import React from 'react'
import { makeStyles } from '@mui/styles';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Avatar from '@mui/material/Avatar';
import AvatarLogo from "../../assets/AvatarLogo.svg"


import LanguageIcon from '@mui/icons-material/Language';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import Discord from '../assets/Disord.svg';
// import AvatarLogo from "../../assets/AvatarLogo.svg"

import { FaDiscord, FaTwitter, FaTelegramPlane } from "react-icons/fa";




const PresaleCard = () => {

    const classes = useStyles();


    return (
        <div className={classes.cardContainer}>

            <div className={classes.headerContainer}>

                <Grid container sx={{border: "0px solid black", height: "100%", width: "100%", display: "flex", justifyContent: "space-between"}}>
                   
                    <Grid item xs={4} lg={5} sx={{border: "0px solid black", display: "flex" }}>

                        {/* <Grid item xs={6} style={{border: "0px solid black", display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <Avatar 
                                src={AvatarLogo}
                                alt="Coin Logo"
                                sx={{ border: "0px solid black", width: 50, height: 50, bgcolor: "#F5F5F5", }} />
                        </Grid>
                    
                        <Grid item xs={6}  style={{border: "0px solid black", display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <div style={{border: "0px solid black"}}>
                                <div style={{border: "0px solid black", fontSize: "16px", fontWeight:"600", color: "#363636"}}>
                                    PICNIC
                                </div >
                                <div style={{border: "0px solid black", fontSize: "14px", color: "#CCCCCC"}}>
                                    $PIC
                                </div>
                            </div>
                        </Grid> */}
                    <LogoNameSymbol src={AvatarLogo} name="PICNIC" symbol="$PIC" logoHeight={50} />
                    </Grid>

                    <Grid item lg={5} sx={{ border: "0px solid black", display: "flex", alignItems: "center"}}>
                                
                                <a href="https://www.google.com" target="_blank">  
                                    <LanguageIcon sx={{border: "0px solid black", width: "30px", height: "20px", color: "#1F88FE"}}/>  
                                </a>
                                <a href="https://www.discord.com/" target="_blank">  
                                    <FaDiscord style={{border: "0px solid black", width: "30px", height: "20px", color: "#1F88FE"}}/>
                                </a>
                                <a href="https://www.twitter.com" target="_blank">  
                                    <FaTwitter style={{border: "0px solid black", width: "30px", height: "20px", color: "#1F88FE"}}/>
                                </a>
                                <a href="https://www.telegram.com" target="_blank">  
                                    <FaTelegramPlane style={{border: "0px solid black", width: "30px", height: "20px", color: "#1F88FE"}}/>
                                </a>

                    </Grid>

                
                </Grid>


            </div>
            
            <div className={classes.progressContainer}>
                <CircularStatic />
            </div>
                        
            <div className={classes.data1Container}>
                
                <div className={classes.data1SubContainer}>
                    <div className={classes.data1SubContainerPrimaryText}>
                        Type
                    </div>
                    <Tooltip title="Open for all">
                        <div className={classes.data1SubContainerSecondaryText}>    
                            Open
                        </div>
                    </Tooltip>
                </div>



                <div className={classes.data1SubContainer}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    Tokens on Sale
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    5500000
                    </div>
                </div>
                
                <div className={classes.data1SubContainer}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    Price
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    0.05 BNB
                    </div>
                </div>
                
                <div className={classes.data1SubContainer}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    Soft Cap
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    8000 NEWC
                    </div>
                </div>

                <div className={classes.data1SubContainer} style={{border: "0px"}}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    Liquidity
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    70%
                    </div>
                </div>

                <Divider sx={{bgcolor: "#1F88FE", marginTop: "10px", paddingTop: "1px"}} />
            </div>            
            

            <div className={classes.data2Container}>
                
                <div className={classes.data1SubContainer}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    Total BNB deposited
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    73 188
                    </div>
                </div>

                <div className={classes.data1SubContainer}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    PICNIC Tokens available
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    950 000
                    </div>
                </div>

                <div className={classes.data1SubContainer} style={{border: "0px"}}>
                    <div className={classes.data1SubContainerPrimaryText}>
                    Your share of the pool
                    </div>
                    <div className={classes.data1SubContainerSecondaryText}>
                    0%
                    </div>
                </div>

            </div>

        </div>
    )
}

export default PresaleCard



const useStyles = makeStyles(() => ({
    cardContainer: {
        backgroundColor: "#ffffff",
        // border: "1px solid black",
        padding: "10px",
        // height: "100%",
        // margin: "10px",

    },
    headerContainer: {
        border: "0px solid black",
        height: "60px"
    },
    progressContainer: {
        // border: "1px solid black",
        height: "180px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    data1Container: {
        // border: "1px solid black",
        height: "200px"
    },
    data1SubContainer: {
        marginTop: "10px",
        borderWidth: "0px 0px 1px 0px",
        borderColor: "#F2F2F2",
        borderStyle: "solid",
        lineHeight: "27px",
        display: "flex",
        justifyContent: "space-between",
        alignsel: "center"

    },
    data1SubContainerPrimaryText: {
        // border: "1px solid black",
        color: "#363636",
        fontSize: "14px",
        display: "flex",
        alignItems: "center"
    },
    data1SubContainerSecondaryText: {
        // border: "1px solid black",
        color: "#7D7D7D",
        fontSize: "16px",
        display: "flex",
        alignItems: "center"

    },

    data2Container: {
        // border: "1px solid black",
        height: "100px"
    },
    data2SubContainer: {
        borderWidth: "0px 0px 1px 0px",
        borderColor: "#F2F2F2",
        borderStyle: "solid",
        lineHeight: "25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"

    },

}));


import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fontSize } from '@mui/system';
import LogoNameSymbol from '../LogoNameSymbol';

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{  
        //   border: "10px solid #CCCCCC", borderRadius: "50%",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
          {/* <div style={{border: "0px solid black"}}>
            <div style={{
                border: "0px solid black", 
                width: "100%", 
                textAlign: "center", 
                color: "#363636", 
                fontSize: "20px", 
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "cetner"
                }}>
                
                    <AccessTimeIcon /> 
                
                <div style={{ border: "0px solid black", display: "flex", justifyContent: "center", alignItems: "cetner" }}>
                    PENDING
                </div>
                
            </div>
            <div style={{border: "0px solid black", margin: "auto", width: "80%", textAlign: "center", color: "#CCCCCC", fontSize: "14px"}}>
                    Sale Starts in: 13:08:11:30
            </div>
          </div> */}

          <div style={{border: "0px solid black"}}>
          <div style={{
                border: "0px solid black", 
                width: "100%", 
                textAlign: "center", 
                color: "#363636", 
                fontSize: "20px", 
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "cetner"
                }}>
                               
                <div style={{ border: "0px solid black", display: "flex", justifyContent: "center", alignItems: "cetner" }}>
                    
                    {`${Math.round(props.value)}% SOLD`}
                    
                </div>
                
            </div>
            <div style={{border: "0px solid black", margin: "auto", width: "80%", textAlign: "center", color: "#CCCCCC", fontSize: "14px"}}>
                    Sale Ends in: 13:08:11:30
            </div>
          </div>

        
      </Box>
    </Box>
  );
}

const CircularStatic = () => {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return <CircularProgressWithLabel value={100} size={180} thickness={2} />
}
