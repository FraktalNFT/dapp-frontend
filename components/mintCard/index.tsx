import { Button, ButtonProps } from "@chakra-ui/button";
import { forwardRef  } from "react";
import FrakButton3 from "../button3";
import styles from "../../styles/mint-nft.module.css";
const MintCard = (({ setName, setDescription, addFile, file }) => {
  function openLocal(){
    document.getElementById('imageInput').files = null;
    document.getElementById('imageInput').click()
  }

  return (
    <div>
      <div style={{
        fontSize:'12px',
        lineHeight: '14px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#656464'
      }}>NAME</div>
      <input
        className={styles.input}
        id="nameIn"
        placeholder = "Give your NFT a Unique and Catchy Name"
        onChange={(e)=>setName(e.target.value)}
      />
      <div>
        <div style={{
          fontSize:'12px',
          lineHeight: '14px',
          marginTop: '24px',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#656464'
        }}>image</div>
        <FrakButton3
          style={{marginTop: ''}}
          isReady={true}
          onClick={()=> openLocal()}
          setFunction={()=> addFile()}
          inputPlaceholder = 'PNG, GIF, WEBP, MP4 or MP3'
        >
          {file ? "Change image" : "Choose image"}
        </FrakButton3>
      </div>
      <div
        style={{
          fontSize:'12px',
          lineHeight: '14px',
          marginTop: '55px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#656464',
          fontWeight: 600
        }}
      >
        DESCRIPTION (OPTIONAL)
      </div>
      <input
      className={styles.input}
      id="descriptionIn"
      placeholder="Write something about your NFT  "
      onChange={(e)=>setDescription(e.target.value)}
      />
    </div>

  );
});

export default MintCard;
