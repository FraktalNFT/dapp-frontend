/**
 * React
 */
import React, {useEffect, useState}  from "react";
/**
 * Chakra
 *
 */
import {
  Link,
  Text,
  Icon,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import FraktionsDetail from '../fraktionsDetail';
/**
 * Component
 */
import FrakButton from '../../components/button4'
/**
 * Icons
 */
import { AiOutlineInfoCircle } from 'react-icons/ai';
import {validateAsset} from "@/utils/openSeaAPI";
// if account has fraktions.. display info to list?

const FraktionsList=(({nftObject, fraktionsListed, tokenAddress, marketAddress, provider}) => {

  const [opeaSeaURL, setOpeaSeaURL] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [validationState, setValidationState] = useState(false);

  async function validateNFT() {
    setValidationState(true);
    const response = await validateAsset(nftObject.collateral.id, 1);
    console.log('response', response)
    setValidationState(false);
    if (response.success === false) {
        setMessage("NFT is not valid");
        setOpenModal(true);
    } else if (response.permalink !== undefined) {
        setOpeaSeaURL(response.permalink);
        window.open(response.permalink, '_blank');
    }
  }

  return(
      <>
        <ModalOpenSeaValidation
            nftObject={nftObject}
            message={message}
            opeaSeaURL={opeaSeaURL}
            openModal={openModal}
            setOpenModal={setOpenModal}  />
        <div style={{
          borderRadius:'4px',
          borderWidth:'1px',
          borderColor:'#E0E0E0',
          padding: '16px',
          marginTop:'40px 0px'
        }}
        >
          <div style={{
            color:'#5A32F3',
            fontWeight:'bold',
            fontFamily:'Inter',
            fontSize:'24px',
            lineHeight:'29px',
            display: "flex",
            justifyContent: "space-between"
          }}>
            Fraktions
            <div>
              <FrakButton
                  disabled={validationState}
                  onClick={() =>
                      validateNFT()
                  }
              >
                Verify On Opensea
              </FrakButton>
              <Tooltip
                  border=" 1px solid #00C49D"
                  borderRadius="4px"
                  boxShadow="none"
                  padding="8px"
                  fontSize="14px"
                  bg="#fff"
                  color="#656464"
                  placement="top"
                  label="Make sure to check that the NFT you are buying Fraktions of is authentic."
                  offset={[0, 20]}
              >
        <span style={{ cursor: 'pointer', paddingLeft: 4 }}>
          <Icon as={AiOutlineInfoCircle} w={10} h={10} color="#00C49D" />
        </span>
              </Tooltip>
            </div>

          </div>
          {fraktionsListed && fraktionsListed.length ?
              <div>
                {fraktionsListed.map(x=>{
                  return(
                      <FraktionsDetail
                          key={x.id}
                          amount={x.amount}
                          price={x.price}
                          seller={x.seller.id}
                          tokenAddress={tokenAddress}
                          marketAddress={marketAddress}
                          provider={provider}
                      />
                  )
                })}
              </div>
              :
              <div style={{marginTop:'24px'}}>
                There are no listed Fraktions of this NFT.
              </div>
          }
        </div>
     </>
  )

})

const ModalOpenSeaValidation = ({nftObject, opeaSeaURL, openModal, setOpenModal, message}) => {

  const closeModal = () => {
    setOpenModal(false);
  }

  const isValidated = () => {
    if (validationState == "OK") {
      return true;
    }
  }

  return (
      <Modal isOpen={openModal} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent
            textAlign={'center'}
            maxWidth={400}
            padding={'60px 0'}
            borderRadius={15}
            boxShadow={'0px 7px 20px rgba(0, 0, 0, 0.35)'}
        >
          <ModalHeader>{nftObject.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
              <Text color="rgba(255, 0, 0, 1);">{message}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
  );
}

export default FraktionsList;
