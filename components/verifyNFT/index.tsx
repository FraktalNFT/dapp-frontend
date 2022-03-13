/**
 * React
 */
import React, {useEffect, useState}  from "react";
/**
 * Chakra
 *
 */
import {
    Text,
    Icon,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
/**
 * Component
 */
import FrakButton from '../../components/button4'

/**
 * Icons
 */
import { AiOutlineInfoCircle } from 'react-icons/ai';
/**
 * Utils
 */
import {validateAsset} from "@/utils/openSeaAPI";

const VerifyNFT =(({nftObject}) => {
    console.log('NFTOBJect', nftObject)
    const [opeaSeaURL, setOpeaSeaURL] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [message, setMessage] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    async function validateNFT() {
        setIsValidating(true);
        let response;
        if (nftObject.collateral !== undefined) {
            let contract, tokeId;
            if (nftObject.collateral.id.includes("-")) {
                const native = nftObject.collateral.id.split("-");
                contract = native[0];
                tokeId = native[1];
            } else {
                contract = nftObject.collateral.id;
                tokeId = 1;
            }
            response = await validateAsset(contract, tokeId);
        }
        setIsValidating(false);
        if (response === undefined || response.success === false) {
            setMessage("NFT was minted on Fraktal");
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
                color:'#5A32F3',
                fontWeight:'bold',
                fontFamily:'Inter',
                fontSize:'24px',
                lineHeight:'29px',
                display: "flex",
                justifyContent: "center"
            }}>
                <div>
                    <FrakButton
                        disabled={isValidating}
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
        </>
    );

});

const ModalOpenSeaValidation = ({nftObject, opeaSeaURL, openModal, setOpenModal, message}) => {

    const closeModal = () => {
        setOpenModal(false);
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
                    <Text>{message}</Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default VerifyNFT;