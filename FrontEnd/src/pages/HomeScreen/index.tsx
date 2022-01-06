import React from 'react'
import { makeStyles } from '@mui/styles';
import Button from '@mui/material/Button';
import picnicLogo from "../../assets/picLogo.svg"
import bnbLogo from "../../assets/bnbLogo.svg"
import ethLogo from "../../assets/ethLogo.svg"
import steps from "../../assets/Steps.svg"


const HomeScreen = () => {

    const classes = useStyles();


    return (
        <div className={classes.homeScreenContainer} >

            <div className={classes.container1} >

                <div className={classes.container1Text1} >
                    $PICNIC
                </div>

                <div className={classes.container1Text2} >
                    Token Sale Launchpad for Everyone
                </div>

                <div className={classes.container1Text3} >
                    PICNIC Launchpad is a home of safe coin launches. <br />
                    Grab some $PICNIC today!
                </div>

                <div className={classes.container1Buttons} >
                    <Button
                        color="secondary"
                        variant="contained"
                        sx={{
                            fontFamily: "Roboto Open Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
                            height: "35px",
                            width: "160px",
                            marginLeft: "20px",
                            color: "#ffffff",
                            borderRadius: 0,
                        }}
                    >
                        Create a Presale
                    </Button>

                    <Button
                        color="primary"
                        variant="contained"
                        sx={{
                            fontFamily: "Roboto Open Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
                            height: "35px",
                            width: "160px",
                            marginLeft: "20px",
                            color: "#ffffff",
                            borderRadius: 0,
                        }}
                    >
                        Lock Tokens
                    </Button>


                </div>

            </div>


            <div className={classes.container2} >

                <div className={classes.container2StatContainer} >
                    <div className={classes.container2StatBox} >
                        <div className={classes.container2StatBoxText1} >
                            51
                        </div>
                        <div className={classes.container2StatBoxText2} >
                            Launches
                        </div>
                    </div>

                    <div className={classes.container2StatBox} >
                        <div className={classes.container2StatBoxText1} >
                            $2502
                        </div>
                        <div className={classes.container2StatBoxText2} >
                            Total Value Locked
                        </div>
                    </div>

                    <div className={classes.container2StatBox} >
                        <div className={classes.container2StatBoxText1} >
                            1025
                        </div>
                        <div className={classes.container2StatBoxText2} >
                            Total Projects
                        </div>
                    </div>

                    <div className={classes.container2StatBox} >
                        <div className={classes.container2StatBoxText1} >
                            8484
                        </div>
                        <div className={classes.container2StatBoxText2} >
                            Total Liquidity
                        </div>
                    </div>                   
                </div>

                <div className={classes.container2Text1} >
                        We Currently Support
                        <div className={classes.container2logos}>
                            <img src={picnicLogo} alt="picnic" />
                        </div>
                        <div className={classes.container2logos}>
                            <img src={bnbLogo} alt="bnbLogo" />
                        </div>
                        <div className={classes.container2logos}>
                            <img src={ethLogo} alt="ethLogo" />
                        </div>
                </div>

            </div>


            <div className={classes.container3} >

            <div className={classes.container3Text1}>
                <div className={classes.container3SubText1} >
                    PICNIC Tools
                </div>

                <div className={classes.container3SubText2} >
                    For Token Sale
                </div>
            </div>

                <div className={classes.container3Text3} >
                    We will help you create and manage your tokens
                </div>

                <div className={classes.container3Steps} >
                    <img src={steps} alt="steps" height="280px"/>
                </div>
                

            </div>


            <div className={classes.container4} >

                <div className={classes.container4Text} >

                   <span className={classes.container4subText1} >
                        Lastest Projects 
                   </span>
                   <span className={classes.container4subText2} >
                        Pre-Sale on PICINC
                   </span>
                
                </div>

                <div className={classes.container4CardsContainer} >
                    
                    <div className={classes.cardsContainer} >
                        Card1
                    </div>
                    <div className={classes.cardsContainer} >
                        Card2
                    </div>
                    <div className={classes.cardsContainer} >
                        Card3
                    </div>
                </div>

                <div className={classes.moreCardsButton}>
                    <Button
                        color="primary"
                        variant="contained"
                        sx={{
                            fontFamily: "Roboto Open Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
                            height: "40px",
                            width: "180px",
                            marginLeft: "20px",
                            color: "#ffffff",
                            borderRadius: 0,
                        }}
                    >
                        Show All Projects
                    </Button>
                </div>
                
            </div>

        </div>
    )
}

export default HomeScreen


const useStyles = makeStyles(() => ({
    homeScreenContainer: {
        // border: "1px solid black",
        fontFamily: "Roboto Open Sans, sans-serif",
    },


    container1: {
        // border: "1px solid blue",
        margin: "auto",
        padding: "20px",
        width: "80%",
        marginBottom: "50px",
        fontWeight: "bold",
        lineHeight: "70px"
    },
    container1Text1: {
        fontSize: "48px",
        textAlign: "center",
        letterSpacing: "0.1em",
        color: "#53C48A",
    },
    container1Text2: {
        fontSize: "48px",
        textAlign: "center",
        color: "#363636",

    },
    container1Text3: {
        // border: "1px solid blue",
        margin: "auto",
        width: "70%",
        marginTop: "10px",
        fontWeight: "500",
        fontSize: "22px",
        color: "#7D7D7D",
        textAlign: "center",
        lineHeight: "140%",
    },
    container1Buttons: {
        // border: "1px solid blue",
        width: "40%",
        margin: "auto",
        marginTop: "25px",
        display: "flex",
        justifyContent: "space-around"
    },


    container2: {
        border: "0px solid blue",
        margin: "auto",
        padding: "20px",
        width: "80%",
        marginBottom: "100px",

    },
    container2StatContainer: {
        // border: "1px solid blue",
        display: "flex",
        justifyContent: "center",
        marginBottom: "10px",

        
    },
    container2StatBox: {
        // border: "1px solid blue",
        width: "20%",
    },
    container2StatBoxText1: {
        // border: "1px solid blue",
        width: "100%",
        fontWeight: "bold",
        lineHeight: "100%",
        fontSize: "48px",
        textAlign: "center",
        color: "#363636",
        display: "flex",
        justifyContent: "center",

        
    },
    container2StatBoxText2: {
        display: "flex",
        justifyContent: "center",
        // border: "1px solid blue",
        width: "100%",
        color: "#7D7D7D",
        lineHeight: "140%",
        fontWeight: "500",
        fontSize: "18px",


    },
    container2Text1: {
        // border: "1px solid blue",
        margin: "auto",
        padding: "20px",
        width: "60%",

        fontWeight: "bold",
        fontSize: "20px",
        lineHeight: "23px",
        color: "#363636",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

    },
    container2logos: {
        // border: "1px solid blue",
        paddingLeft: "10px"
    },



    container3: {
        // border: "1px solid blue",
        margin: "auto",
        padding: "20px",
        width: "80%",
        marginBottom: "200px",
    },
    container3Text1: {       
        fontWeight: "900",
        fontSize: "48px",
        lineHeight: "59px",
        marginBottom: "20px"
        
    },
    container3SubText1: {
        textAlign: "center",
        color: "#53C48A",

    },
    container3SubText2: {
        textAlign: "center",
        color: "#363636",

    },
    container3Text3: {
        fontWeight: "500",
        fontSize: "18px",
        lineHeight: "21px",
        /* identical to box height */
        textAlign: "center",
        color: "#7D7D7D",
        opacity: "0.85",
        
    },
    container3Steps: {
        display: "flex",
        justifyContent: "center",
        margin: "-80px"

    },

    container4: {
        // border: "1px solid blue",
        margin: "auto",
        padding: "20px",
        width: "80%",
        marginBottom: "100px",
    },
    container4Text: {
        // border: "1px solid blue",
        fontWeight: "800",
        fontSize: "36px",
        lineHeight: "59px",
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"

    },
    container4subText1: {
        // border: "1px solid blue",
        textAlign: "center",
        color: "#53C48A",

    },
    container4subText2: {
        // border: "1px solid blue",
        textAlign: "center",
        color: "#363636",
        marginLeft: "10px"
    },
    container4CardsContainer: {
        // border: "1px solid blue",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "50px"
    },
    cardsContainer: {
        border: "1px solid #b1a9a9",
        width: "308px",
        height: "580px",
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    moreCardsButton : {
        // border: "1px solid blue",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"

    }



}));