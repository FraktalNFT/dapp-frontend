import {Box, Button, Spacer, Flex, Stack, HStack, VStack, Text} from "@chakra-ui/react";
import styles from "./airdrop.module.css";

/**
 * Airdrop Banner
 * @param {any} title
 * @param {any} subtitle
 * @param {any} onClick
 * @param {any} buttonText
 * @param {any} icon
 * @returns {any}
 * @constructor
 */
const AirdropBanner = ({title, subtitle, onClick, buttonText, icon}) => {

    return (
        <Stack className={styles.container}>
            <Flex margin="auto 0">
                <Box margin="auto" marginLeft="24px" marginRight="24px"  width="40px">
                        <Text fontSize="32px">{icon}</Text>
                </Box>
                <VStack margin="auto" alignItems="flex-start" >
                        <Box>
                            <h2 className={styles.airdropTitle}>{title}</h2>
                        </Box>
                        {subtitle && (
                        <Box marginTop="0">
                            <Text className={styles.subtitle}>{subtitle}</Text>
                        </Box>
                        )}
                </VStack>
                <Spacer />
                <Box  marginRight="25px" alignItems="flex-end" height="100%">
                        <Button
                            onClick={onClick}
                            fontSize="14px"
                            width="160px"
                            height="40px"
                            borderRadius="24px"
                            color="#fff"
                            backgroundColor="#985CFF" className={styles.airdropButton}>{buttonText}</Button>
                </Box>
            </Flex>
        </Stack>
    );
};

export default AirdropBanner;