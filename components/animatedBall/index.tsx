import * as React from "react";
import { motion } from "framer-motion";
type AnimatedBallProps = {
  color: string;
  delay: number;
};
export default function index({ color, delay }: AnimatedBallProps) {
  const transitionValues = {
    duration: 0.4,
    repeat: Infinity,
    repeatType: "reverse",
    delay,
    ease: "linear",
  };

  const ballStyle = {
    display: "block",
    width: "7px",
    height: "7px",
    backgroundColor: color,
    borderRadius: "50%",
    zIndex: 99999,
  };

  return (
    <motion.span
      style={ballStyle}
      transition={{
        y: transitionValues,
      }}
      animate={{
        y: [-3, 0, 3],
      }}
    />
  );
}