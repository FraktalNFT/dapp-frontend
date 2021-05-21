import React from "react";
import ReactModal from "react-modal";
import { Image } from "@chakra-ui/react";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    padding: 0,
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
}

ReactModal.setAppElement("#app");

const Modal: React.FC<Props> = ({ open, onClose, children }) => {
  return (
    <ReactModal isOpen={open} onRequestClose={onClose} style={customStyles}>
      <div style={{ position: "relative" }}>
        <Image
          pos={"absolute"}
          top="24px"
          right="24px"
          src="/close.svg"
          cursor="pointer"
          onClick={onClose}
        />
        {children}
      </div>
    </ReactModal>
  );
};

export default Modal;
