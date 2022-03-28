import { Button, ButtonProps } from "@chakra-ui/button";
import { forwardRef } from "react";
import FrakButton3 from "../button3";
import styles from "../../styles/mint-nft.module.css";
import { Box, Input, Textarea } from "@chakra-ui/react";
const NFTCard = ({ setName, setDescription, addFile, file, fileUpload=true, nftName = "" }) => {
  function openLocal() {
    document.getElementById("imageInput").files = null;
    document.getElementById("imageInput").click();
  }

  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          lineHeight: "14px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#656464",
        }}
      >
        NAME
      </div>
      <Input
        value={nftName}
        id="nameIn"
        placeholder="Give your NFT a Unique and Catchy Name"
        sx={{
          fontSize: `14px`,
          width: `clamp(250px, 33vw, 400px)`,
          padding: `24px 16px`,
          margin: `1ex 0`,
          borderRadius: `24px`
        }}
        onChange={e => setName(e.target.value)}
      />
      {fileUpload ? 
      (<div>
        <div
          style={{
            fontSize: "12px",
            lineHeight: "14px",
            marginTop: "24px",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#656464",
          }}
        >
          image
        </div>
        <Box sx={{height: `16px`}}></Box>
        <FrakButton3
          isReady={true}
          onClick={() => openLocal()}
          setFunction={() => addFile()}
          inputPlaceholder="PNG, JPG or GIF"
        >
          {file ? "Change File" : "Choose File"}
        </FrakButton3>
        <Box sx={{height: `16px`}}></Box>
      </div>): null}
      <div
        style={{
          fontSize: "12px",
          lineHeight: "14px",
          marginTop: "55px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#656464",
          fontWeight: 600,
        }}
      >
        DESCRIPTION (OPTIONAL)
      </div>
      <Textarea
        id="descriptionIn"
        placeholder="Write something about your NFT"
        onChange={e => setDescription(e.target.value)}
        sx={{
          fontSize: `14px`,
          width: `clamp(250px, 33vw, 400px)`,
          padding: `16px 16px`,
          margin: `1ex 0`,
          borderRadius: `24px`
        }}
      />
    </div>
  );
};

export default NFTCard;
