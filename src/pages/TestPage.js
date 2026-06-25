import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";


const TestPage = () => {

    const [counter, setCounter] = useState(0);
    const [price,setPrice] = useState(100);

    const handleClick = () => {

        setCounter(counter + 1);
      };

    useEffect(() => {
        var NewPrice = price* 2;
        setPrice(NewPrice);
      }, [counter]);


  return (<div>
            <Typography variant="h4" gutterBottom>
            Counter is  {counter} price is {price}
            </Typography>

            <Button onClick ={handleClick}>submit</Button>

  </div>

    );
};

export default TestPage;
