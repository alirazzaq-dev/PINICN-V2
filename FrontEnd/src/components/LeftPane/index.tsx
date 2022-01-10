import React from 'react'
import './styles.css';
import productSVG from "../../assets/product.svg"
import RemoveIcon from '@mui/icons-material/Remove';
import './styles.css'
import { Link } from "@mui/material";
// import { makeStyles } from '@mui/styles';
import { styled } from '@mui/styles';


const LeftPaneContainer = styled("div")({
    // border: "1px solid red",
    width: "100%",
    minHeight: "89vh",
    display:"flex",
    flexDirection: "column",    
    background: "#FFFFFF",
    // border: "1px solid rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
    boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.02)"
})

const PaneContainer = styled("div")({
    // border: "1px solid black",
    height: "100%",
    margin: "0px",
    marginTop: "50px",
    marginLeft: "0px",
    /* padding: "10px" */
        "@media (max-width: 900px)": {
            // border: "1px solid black",
            height: "100%",
            // margin: "5px",
            marginTop: "10px",
            /* padding: 10px; */
        }
})


const MainHeadingContainer = styled("div")({
        // border: "1px solid black",
        display: "flex",
        alignItems: "center",
        padding: "10px",
})

const MainHeadingText = styled("span")({
    fontFamily: "Roboto Open Sans, sans-seri",
    
    fontWeight: "500",
    fontSize: "24px",
    marginLeft: "10px"
})

const ProductDetailContainer = styled("div")({
    // border: "1px solid black",
        marginTop: "10px"
})

const ProductHeading = styled("div")({
    // border: "1px solid black",
    display: "flex",
    alignItems: "center",
    fontFamily: "Roboto Open Sans, sans-serif",
    color: "#1F88FE",
    fontWeight: "400",
    fontSize: "16px",
})

const ProductSubheadingText = styled("div")({
    // border: "1px solid black",
    fontFamily: "Roboto Open Sans, sans-serif",
    fontSize: "16px",
    fontWeight: "500",
    padding: "12px",
    display: "flex",
})


export const LeftPaneContent = () => {


    const Icon = () => (
        <RemoveIcon  />
    )

    const tabStyle = (url: string) => {
        return({
            color: window.location.pathname === url ? "#fff":"#000",
            background: window.location.pathname === url ? "#53C48A":"#ffffff" 
        })
    }


    return (
        <PaneContainer>

            <MainHeadingContainer>
                <img src={productSVG} alt="Products" />
                <MainHeadingText> 
                    Products 
                </MainHeadingText>
             </MainHeadingContainer>
            
            <ProductDetailContainer > 
                <ProductHeading> <Icon /> PICNIC LaunchPad </ProductHeading>
                
                    <Link href="/PresaleForm" style={{ textDecoration: "none", cursor: "pointer",  }}>
                        <ProductSubheadingText style={tabStyle("/PresaleForm")} > 
                                Create a presale 
                        </ProductSubheadingText>
                    </Link>

                    <Link href="/Presales" style={{ textDecoration: "none", cursor: "pointer" }}>
                        <ProductSubheadingText style={tabStyle("/Presales")} > 
                                    Presale listings
                        </ProductSubheadingText>
                    </Link>

            </ProductDetailContainer>

            <ProductDetailContainer > 
                <ProductHeading> <Icon /> PICNIC Locker </ProductHeading>
                    
                    <Link href="/TokenLocker" style={{textDecoration: "none", cursor: "pointer"}}>
                        <ProductSubheadingText style={tabStyle("/TokenLocker")} > 
                            Token Locker 
                        </ProductSubheadingText>
                    </Link>

                    <Link href="/LockerListing" style={{textDecoration: "none", cursor: "pointer" }}>
                        <ProductSubheadingText style={tabStyle("/LockerListing")} > 
                            Locked Tokens Listings 
                        </ProductSubheadingText>
                    </Link>
            </ProductDetailContainer>

            <ProductDetailContainer > 
                <ProductHeading> <Icon /> PICNIC LP Locker </ProductHeading>
                    
                    <Link href="/LPLocker" style={{textDecoration: "none", cursor: "pointer" }}>
                        <ProductSubheadingText style={tabStyle("/LPLocker")} > 
                            LP Toker
                        </ProductSubheadingText>
                    </Link>

                    <Link href="/LPLockerListing" style={{textDecoration: "none", cursor: "pointer"}}>
                        <ProductSubheadingText style={tabStyle("/LPLockerListing")} > 
                            Locked LP Listings 
                        </ProductSubheadingText>
                    </Link>
            </ProductDetailContainer>

        </PaneContainer>
    )

}


const LeftPane = () => {

    return (
        <LeftPaneContainer >
            {LeftPaneContent()}
        </LeftPaneContainer>

    )
}

export default LeftPane;



// const useStyles = makeStyles(() => ({
//     leftPaneContainer: {
//     /* border: 1px solid black; */
//     width: "100%",
//     minHeight: "89vh",
//     display:"flex",
//     flexDirection: "column",    
//     background: "#FFFFFF",
//     border: "1px solid rgba(0, 0, 0, 0.05)",
//     boxSizing: "border-box",
//     boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.02)"
//     },

//     paneContainer: {
//     /* border: "2px solid black"; */
//     height: "100%",
//     margin: "10px",
//     marginTop: "70px",
//     marginLeft: "20px",
//     /* padding: "10px" */
//         "@media (max-width: 900px)": {
//             border: "1px solid black",
//             height: "100%",
//             margin: "5px",
//             marginTop: "10px",
//             /* padding: 10px; */
// },
//     },
//     mainHeadingContainer: {
//         display: "flex",
//         alignItems: "center",
//         marginBottom: "10px",
//     },
//     mainHeadingText: {
//         fontFamily: "Roboto Open Sans, sans-seri",
//         fontWeight: "500",
//         fontSize: "24px",
//         marginLeft: "10px"
//     },
//     productDetailContainer: {
//     /* border: "1px solid black"; */
//         marginTop: "20px"
//     },
//     productHeading: {
//         /* border: "1px solid black", */
//         display: "flex",
//         alignItems: "center",
//         fontFamily: "Roboto Open Sans, sans-serif",
//         color: "#1F88FE",
//         fontWeight: "400",
//         fontSize: "16px",
//     },
//     productSubheadingText: {
//         /* border: "1px solid black", */
//         fontFamily: "Roboto Open Sans, sans-serif",
//         fontSize: "16px",
//         fontWeight: "400",
//         marginTop: "18px",
//         color: "black"
        
//     }
// }));

