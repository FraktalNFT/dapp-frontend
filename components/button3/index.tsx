import { Button, ButtonProps } from "@chakra-ui/button";
import { Input, Box } from "@chakra-ui/react";
import { forwardRef } from "react";

const FrakButton3 = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isReady?: boolean; setFunction: Function; inputPlaceholder: string }
>(({ isReady, onClick, setFunction, inputPlaceholder, children, ...rest }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: `space-between`,
        alignItems: `center`,
        border: `2px solid #405466`,
        borderRadius: "16px",
        width: `clamp(250px, 33vw, 400px)`,
        position: `relative`,
        height: `auto`,
      }}
    >
      <Input
        type="file"
        id="imageInput"
        multiple={false}
        onChange={d => setFunction(d.target.value)}
        placeholder={inputPlaceholder ? inputPlaceholder : null}
        style={{
          display:'none',
          textAlign: "right",
          color: "#000000",
          fontWeight: 500,
          fontSize: "24px",
          outline: `none`,
          border: `1px solid transparent`,
          borderRadius: `15px 0px 0px 15px`,
          height: `40px`,
          marginRight: `134px`,
        }}
      />
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
          height: `40px`,
          width: `134px`,
          transform: `translateX(2px) translateY(-2px)`,
          boxSizing: `content-box`,
          marginLeft: `auto`,
          marginBottom: `-4px`,
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
    </Box>
  );
});

export default FrakButton3;
