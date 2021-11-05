import { Button, ButtonProps } from "@chakra-ui/button";
import { Input } from "@chakra-ui/react";
import { forwardRef } from "react";

const FrakButton2 = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isReady?: boolean; setFunction: Function }
>(({ isReady, onClick, setFunction, children, ...rest }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: `space-between`,
        alignItems: `center`,
        border: `2px solid #405466`,
        borderRadius: "16px",
        maxWidth: `288px`,
        position: `relative`,
      }}
    >
      <Input
        onChange={d => setFunction(d.target.value)}
        style={{
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
