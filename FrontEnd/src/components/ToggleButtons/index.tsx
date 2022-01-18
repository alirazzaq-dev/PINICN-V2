import React, {FC} from 'react'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'

interface ToggleButtonsProps {
    text1: string,
    text2: string
} 

const ToggleButtons: FC<ToggleButtonsProps> = ({text1, text2}) => {
  
    const [alignment, setAlignment] = React.useState('all');
    // const [buttonSelected, setButtonSelected] = React.useState({
    //     button1: true,
    //     button2: false
    // });

    // console.log(buttonSelected)

    // const setButton1 = () => {
    //     if(buttonSelected.button1 === true){
    //         setButtonSelected({button1: false, button2: buttonSelected.button2})
    //     }
    //     else if(buttonSelected.button1 === false){
    //         setButtonSelected({button1: true, button2: false})

    //     }
    // }

    // const setButton2 = () => {
    //     if(buttonSelected.button2 === true){
    //         setButtonSelected({button1: buttonSelected.button1, button2: false})
    //     }
    //     else if(buttonSelected.button2 === false){
    //         setButtonSelected({button1: false, button2: true})
    //     }
    // }

    const handleChange = (
      event: React.MouseEvent<HTMLElement>,
      newAlignment: string,
    ) => {
      setAlignment(newAlignment);
    };

    return (
        <ToggleButtonGroup
        sx={{height: "100%"}}
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
        
        >
        <ToggleButton 
            // onClick={ setButton1 }
            value="all" 
            sx={{border: 0, fontSize: "8px", borderRadius: 0, '&.MuiToggleButton-root.Mui-selected': { 
                backgroundColor: "#1F88FE", 
                color: "#fff" 
                }
            }}>
                {text1}
        </ToggleButton>

        <ToggleButton 
            // onClick={ setButton2 }
            value="my"
            sx={{border: 0, fontSize: "8px", borderRadius: 0, '&.MuiToggleButton-root.Mui-selected': { 
                backgroundColor: "#1F88FE", 
                color: "#fff" 
            }
          }}
          >
            {text2}
        </ToggleButton>

    </ToggleButtonGroup>    )
}

export default ToggleButtons
