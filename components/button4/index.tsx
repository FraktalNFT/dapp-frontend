import { Button, ButtonProps } from "@chakra-ui/button";
import { forwardRef } from "react";
const FrakButton4 = forwardRef<
  HTMLButtonElement,
  ButtonProps & { status?: string }
>(({ status, children, ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      className="medium-16"
      minH="4.8rem"
      px="2.4rem"
      borderWidth="2px"
      background={status != "open" ? "#00C49D" : "black.900"}
      color={"white.900"}
      borderColor={"transparent"}
      rounded="full"
      _hover={{
        background: "white.900",
        color: "black.900",
        border: "2px solid black",
      }}
      _active={{ background: "#00C49D.500", color: "white.900" }}
      _disabled={{ background: "#A7A7A7 !important" }}
      {...rest}
    >
      {children}
    </Button>
  );
});

export default FrakButton4;
