import React from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box
} from "@mui/material";

import {
    DataGrid
} from "@mui/x-data-grid";


const ExpensePayableSkipModal = ({
    open,
    onClose,
    records
}) => {


const columns = [
    {
        field: "funD_NAME",
        headerName: "Fund Name",
        flex: 2,
        minWidth: 200
    },
    {
        field: "expensE_TYPE_NAME",
        headerName: "Expense Type",
        flex: 1.5,
        minWidth: 150
    },
    {
        field: "naV_DATE",
        headerName: "NAV Date",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => {
            return params.value
                ? params.value.substring(0, 10)
                : "";
        }
    },
    {
        field: "skipReason",
        headerName: "Reason",
        flex: 2,
        minWidth: 250
    }
];
return (

<Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
>


<DialogTitle
sx={{
    background:"#bb86fc",
    fontWeight:600
}}
>
Skipped Expense Payable Records
</DialogTitle>


<DialogContent>

<Box
sx={{
    height:400,
    mt:2
}}
>


<DataGrid

rows={records.map((x,index)=>({
    id:index,
    ...x
}))}

columns={columns}

hideFooter

/>

</Box>

</DialogContent>


<DialogActions>

<Button
variant="contained"
onClick={onClose}
>
Close
</Button>


</DialogActions>


</Dialog>

);

};


export default ExpensePayableSkipModal;