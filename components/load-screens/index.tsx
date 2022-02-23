import {
  Flex,
  Box,
  Text,
  Link,
  Badge,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

import {closeModal,
    BUYING_FRAKTIONS,
    OFFERING_BUYOUT,
    COMPLETED_STATUS,
    REJECTED_STATUS,
    PENDING_STATUS
} from "../../redux/actions/contractActions";
import { motion } from "framer-motion";
import {connect} from "react-redux";
import styles from "./loaders.module.css";
import {useRouter} from "next/router";
import React from 'react';

//TODO - CHANGE TO process.env.NEXT_PUBLIC_BLOCK_EXPLORER
const BLOCK_EXPLORER = 'https://rinkeby.etherscan.io/tx/';

/**
 * Load Screen
 * @type {({ open, transaction, setOpenLoadScreen }: {open: any; transaction: any; setOpenLoadScreen: any}) => any}
 */
const LoadScreen = ((props) => {
  const { contractTransaction, closeModal } = props;
  const router = useRouter();

    /**
     * Print State
     * @param state
     * @returns {string}
     */
  const printState = (state) => {
      switch (state) {
          case PENDING_STATUS:
              return 'View Transaction';
            break;
          case COMPLETED_STATUS:
              return 'Transaction Completed';
            break;
          default:
              return '';
      }
  };

  const getButtonStyle = (state): Partial<React.CSSProperties> => {
      switch (state) {
          case PENDING_STATUS:
              return {
                  color: '#7B62AB',
                  background: 'rgba(166, 134, 189, 0.29)'
              };
              break;
          case COMPLETED_STATUS:
              return {
                  color: '#22BBB2',
                  background: 'rgba(145, 207, 166, 0.46)'
              };
              break;
          case REJECTED_STATUS:
              return {
                  color: '#6C7FBF',
                  background: 'rgba(144, 213, 222, 0.46)'
              };
              break;
          default:
              return {};
      }
  };

  const showAmount = (contractTransaction) => {
      switch (contractTransaction.transactionType) {
          case BUYING_FRAKTIONS:
                return contractTransaction.amount + ' Fraktions';
              break;
          case OFFERING_BUYOUT:
              return 'Buy-out of ' + contractTransaction.amount + ' ETH' ;
              break;
      }
  };

  const hasAmount = (contractTransaction) => {
      return contractTransaction.state != REJECTED_STATUS;
  };

  const showTransactionStep = contractTransaction.step != null && contractTransaction.totalStep != null

  return (
      <>
        <Modal isOpen={contractTransaction.modalOpen} onClose={closeModal}>
          <ModalOverlay/>
          <ModalContent textAlign={"center"} maxWidth={400} height={497} padding={"60px 0"} borderRadius={15}  boxShadow={"0px 7px 20px rgba(0, 0, 0, 0.35)"}>
            <ModalHeader></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <LoaderAnimation contractTransaction={contractTransaction}/>
                <Heading
                    marginBottom="4"
                    fontWeight="bold"
                    fontSize="17px"
                    lineHeight="20px"
                    color="#525252">{contractTransaction.heading}</Heading>
                {
                    hasAmount(contractTransaction) && (
                        <Text
                            marginBottom="8px"
                            fontSize="15px"
                            fontWeight="400"
                            lineHeight="1.5px"
                            color="#979797"
                        >{showAmount(contractTransaction)}</Text>
                    )
                }

                {showTransactionStep &&
                    <>
                    <Text
                        marginBottom="10px"
                        color={"#969696"}
                    >Transaction <b>{contractTransaction.step}</b> of <b>{contractTransaction.totalStep}</b></Text>
                    <Text
                        marginBottom="10px"
                        color={"#969696"}
                        fontWeight="700"
                        fontSize="15px"
                        padding="0 60px"
                    >Do not leave this page until confirming all transactions.</Text>
                    </>
                }
                <Text
                    marginBottom="10px"
                    fontSize={contractTransaction.state == REJECTED_STATUS ? "20px" : "15px"}
                    padding="0 60px"
                    fontWeight="500"
                    lineHeight="18px"
                    color={contractTransaction.state == REJECTED_STATUS ? "#FF2323" : "#969696"}
                >{contractTransaction.message}</Text>
                
                {
                    contractTransaction.tx && (
                        <Link
                            href={BLOCK_EXPLORER + contractTransaction.tx}
                            isExternal
                            fontSize="15px"
                            lineHeight="18px"
                            color="#22BBB2"
                            textDecoration="underline !important"
                            _hover={{}}
                        >
                            {printState(contractTransaction.state)}
                        </Link>
                    )
                }

            </ModalBody>
            <ModalFooter marginTop={10} style={{justifyContent: 'center'}}>
                {
                    contractTransaction.button && (
                        <Badge
                        style={getButtonStyle(contractTransaction.state)}
                        width="104px"
                        height="36px"
                        fontWeight="500"
                        borderRadius="50px"
                        fontSize="15"
                        textTransform="none"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >{contractTransaction.button.text}</Badge>
                )
                }

            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
  )

});

const LoaderAnimation = ({contractTransaction}) => {

    const getColor = (state) => {
        switch (state) {
            case PENDING_STATUS:
                return 'rgba(166, 134, 189, 0.29)';
                break;
            case COMPLETED_STATUS:
                return  'rgba(129, 198, 99, 0.18)';
                break;
            case REJECTED_STATUS:
                return  'rgba(255, 0, 0, 0.16);';
                break;
            default:
                return '';
        }
    };

    const getAnimation = (state) => {
        switch (state) {
            case PENDING_STATUS:
                return (<>
                    <LoaderBall
                        animate={{
                            y: [2, 0, -2],
                        }}
                        bgColor={"#7A61AA"}
                        delay={0.1}/>
                    <LoaderBall
                        animate={{
                            y: [-4, 0, 4],
                        }}
                        bgColor={"#90D5DE"}
                        delay={0.1}/>
                    <LoaderBall
                        animate={{
                            y: [-1, 0, 1],
                        }}
                        bgColor={"#22BCB3"}
                        delay={0.1}/>
                </>);
                break;
            default:
                return  <Checkmark state={state}/>;
        }
    };

    return (
        <Box
            marginBottom="44px"
            background={getColor(contractTransaction.state)}
            borderRadius="50%"
            marginLeft="auto"
            marginRight="auto"
            d="flex"
            justifyContent="center"
            alignItems="center"
            gridGap="7px"
            width="60px"
            height="60px"
        >
            {getAnimation(contractTransaction.state)}
        </Box>
    );
};

/**
 * Checkmark or Cross based on state
 * @param {any} state
 * @returns {any}
 * @constructor
 */
const Checkmark = ({state}) => {

    const isCompleted = (state) => {
        return state == COMPLETED_STATUS;
    };

    return (
        <div className={styles.wrapper}>
          <svg style={state == COMPLETED_STATUS ? {stroke: '#22BCB3'} : {stroke: '#FF4F4F'}} className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              {
                  isCompleted(state) ?
                      <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                   : <>
                      <path className={styles.crossPathLeft} fill="none" d="M16,16 l20,20" />
                      <path className={styles.crossPathRight} fill="none" d="M16,36 l20,-20" />
                  </>
              }
          </svg>
        </div>
    );
};

const LoaderBall = ({delay, bgColor, animate}) => {

    const transitionValues = {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        delay,
        ease: "linear",
    };

    const ballStyle = {
        display: "block",
        width: "7px",
        height: "7px",
        backgroundColor: bgColor,
        borderRadius: "50%",
        zIndex: 99999,
    };

    return (<motion.div
        transition={{
            y: transitionValues,
        }}
        style={ballStyle}
        animate={animate}
         />);
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal: () => {
            dispatch(closeModal())
        },
    }
};

const mapStateToProps = (state) => {
    return {
        contractTransaction: state.loadingScreen
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(LoadScreen);