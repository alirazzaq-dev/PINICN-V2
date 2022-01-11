import React, {FC} from 'react'
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';

interface PaginationProps {
    count: number
}

const PaginationComponent: FC<PaginationProps> = ({count}) => {
    return (
        <Pagination count={count} variant="outlined" shape="rounded" 
            renderItem={(item)=> <PaginationItem {...item} 
            sx={{
                fontSize: "14px", borderRadius: 0, color: "#CCCCCC",
                '&.Mui-selected': { 
                    bgcolor: "#53C48A",
                    color: "#fff",
                    borderColor: "transparent",
                    }
                }} 
            />}
        />
    )
}

export default PaginationComponent
