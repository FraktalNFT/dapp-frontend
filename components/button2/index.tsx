import { Button, ButtonProps } from "@chakra-ui/button";
import { Input } from "@chakra-ui/react"
import { forwardRef } from "react";

const FrakButton2 = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isReady?: boolean, onSet: void }
>(({ isReady, onClick, onSet, children, ...rest }) => {
  return (
    <div style={{
      borderWidth:"2px",
      borderColor:"#405466",
      borderRadius:"16px",
      display:'inline-block',
    }}>
      <input onChange={(e)=>onSet(event.target.value)} style={{
        maxWidth:'40%',
        textAlign:'right',
        color:'#000000',
        margin:'0px 16px',
        fontWeight: 500,
        fontSize: '24px',
        lineHeight: '29px'
      }}/>
      <Button
        minH="4.8rem"
        disabled={!isReady}
        background={isReady ? "#405466" : "#A7A7A7"}
        color={"white.900"}
        onClick={onClick}
        style={{fontSize:'16px', padding:'12px 24px'}}
        _hover={{ background: "black.900", color: "white.900" }}
        _active={{ background: "black.900", color: "white.900" }}
        _disabled={{ background: "#A7A7A7 !important" }}
        {...rest}
      >
        {children}
      </Button>
    </div>
  );
});

export default FrakButton2;
