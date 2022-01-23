import React, {FC, useState} from 'react'
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import TablePagination from '@mui/material/TablePagination';


interface PaginationProps {
    total: number,
    page: number,
    setPage: (e: number) => void

}

const PaginationComponent: FC<PaginationProps> = ({total, page, setPage}) => {

    const count = Math.ceil(total/10);
    // console.log("count ", count)

    // const [page, setPage] = useState(1);

    const handleChangePage = (event: unknown, newPage: number) => {
        console.log("handleChangePage", newPage)
        setPage(newPage);
      };
    
    return (
        <Pagination 
            page={page}
            onChange={handleChangePage}
            count={count} variant="outlined" shape="rounded" 
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
