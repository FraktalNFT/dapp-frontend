import { Button, ButtonProps } from "@chakra-ui/button";
import { forwardRef } from "react";

const FrakButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isOutlined?: boolean }
>(({ isOutlined, children, ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      className="medium-16"
      minH="4.8rem"
      px="2.4rem"
      borderWidth="2px"
      background={!isOutlined ? "black.900" : "transparent"}
      color={!isOutlined ? "white.900" : "black.900"}
      borderColor={!isOutlined ? "transparent" : "black.900"}
      rounded="full"
      _hover={{ background: "black.900", color: "white.900" }}
      _active={{ background: "black.900", color: "white.900" }}
      {...rest}
    >
      {children}
    </Button>
  );
});

export default FrakButton;
