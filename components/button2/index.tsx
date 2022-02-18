import { Button, ButtonProps } from "@chakra-ui/button";
import { Input, Text } from "@chakra-ui/react";
import { forwardRef } from "react";


const FrakButton2 = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isReady?: boolean; setFunction: Function; inputPlaceholder: String ; currency: String}
>(({ isReady, onClick, setFunction, inputPlaceholder, currency, children, ...rest }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: `space-between`,
        alignItems: `center`,
        border: `2px solid #405466`,
        borderRadius: "16px",
        maxWidth: `300px`,
        position: `relative`,
      }}
    >

      <Input
        onChange={d => setFunction(d.target.value)}
        placeholder={inputPlaceholder ? inputPlaceholder : null}
        _focus={{ outline: "none" }}
        style={
        {

        //background:"#EFEFEF",
          textAlign: "right",
          color: "#000000",
          fontWeight: 500,
          fontSize: "20px",
          outline: `none`,
          border: `none`,
          borderRadius: `15px 0px 0px 15px`,
          height: `38px`,
          minWidth: "20%",
          marginRight: `0px`,
        }}
      />
      <div>
    <Text
    style={{
    
    	border: `1px solid transparent`,
    	color: '#777777',
    	fontSize: "14px",
    	maxWidth:'50px',
    	padding:'4px',
    	position: 'relative',
    	marginRight: `110px`,
    	boxSizing: `content-box`,
    	transform: `translateX(2px) translateY(-2px)`,                
	}}>{currency ? currency : null}</Text>
	</div>
      <Button
        disabled={!isReady}
        background={isReady ? "#405466" : "#A7A7A7"}
        color={"white.900"}
        onClick={onClick}
        sx={{
          borderRadius: `0px 16px 16px 0px`,
          borderTop: `2px solid #405466`,
          borderRight: `2px solid #405466`,
          borderBottom: `2px solid #405466`,
          fontSize: "1.8rem",
          height: `38px`,
          width: `100px`,
          transform: `translateX(2px) translateY(-2px)`,
          boxSizing: `content-box`,
          position: `absolute`,
          right: `0`,
          top: `0`,
          padding: `0`,
        }}
        _hover={{ background: "black.900", color: "white.900" }}
        _active={{ background: "black.900", color: "white.900" }}
        _disabled={{
          background: "#A7A7A7 !important",
        }}
        {...rest}
      > 
        {children}
      </Button>
    </div>
  );
});

export default FrakButton2;
