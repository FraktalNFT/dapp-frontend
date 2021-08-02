import React from "react";
import ReactModal from "react-modal";
import { NFTItemType } from '../../types';
import { Image } from "@chakra-ui/react";
import { lockShares, transferToken, unlockShares } from '../../utils/contractCalls';
import { useWeb3Context } from "/contexts/Web3Context";

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

typeof window !== "undefined" && ReactModal.setAppElement("#app");

const ListItemOptions: React.FC = ({ item, signer, contract }) => {

  return (
      <>
      {item?
        <div style={{ position: "relative" }}>
        <div>Would you like to list {item.name}?</div>
        <button onClick={()=>lockShares(item.id, 10000, contract, signer, contract)}>Lock the fraktals to the market</button><br />
        <button onClick={()=>transferToken(item.id, 0,1,contract, signer, contract)}>Transfer the nft to the market</button><br />
        <button onClick={()=>unlockShares(item.id, 10000, contract, signer, contract)}>unLock the fraktals to list</button>
        </div>
      :null}
      </>
  );
};

export default ListItemOptions;
