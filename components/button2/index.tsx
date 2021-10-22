import { Button, ButtonProps } from "@chakra-ui/button";
import { Input } from "@chakra-ui/react"
import { forwardRef } from "react";

const FrakButton2 = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isReady?: boolean, onSet: void }
>(({ isReady, onClick, onSet, children, ...rest }) => {
  return (
    <div style={{
      marginTop: '6px',
    }}>
      <input onChange={(e)=>onSet(event.target.value)} style={{
        maxWidth:'40%',
        textAlign:'right',
        color:'#000000',
        height: '100%',
        fontWeight: 500,
        fontSize: '24px',
        lineHeight: '29px',
        borderWidth:"2px",
        borderColor:"#405466",
        borderRadius:"16px 0 0 16px",
      }}/>
      <Button
        minH="4.8rem"
        disabled={!isReady}
        background={isReady ? "#405466" : "#A7A7A7"}
        color={"white.900"}
        onClick={onClick}
        style={{
          fontSize:'16px',
          padding:'12px 24px',
          borderRadius:'0 16px 16px 0',
          borderWidth:"2px",
          height: '100%',
          borderColor:"#405466",
        }}
        _hover={{ background: "black.900", color: "white.900" }}
        _active={{ background: "black.900", color: "white.900" }}
        _disabled={{ background: "#A7A7A7 !important",borderColor:"#A7A7A7 !important" }}
        {...rest}
      >
        {children}
      </Button>
    </div>
  );
});

export default FrakButton2;
