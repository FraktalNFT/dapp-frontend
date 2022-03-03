/**
 * CHAKRA UI
 */
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Icon,
  Link,
  Spacer,
  StackDivider,
  StackProps,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
/**
 * Styles
 */
import styles from './tabsCard.module.css';
/**
 * FRAKTAL Components
 */
import FrakButton from '@/components/button';
import FrakButton2 from '@/components/button2';

/**
 * ICONS
 */

import { AiOutlineInfoCircle } from 'react-icons/ai';

interface TabsCardProps extends StackProps {
  height?: string;
}

/**
 * CardTabs
 * @returns {any}
 * @constructor
 */
const TabsCard = ({
  title,
  secondaryText,
  currency,
  labelTooltip,
  children,
}) => {
  return (
    <VStack e alignItems="left">
      {title && (
        <Flex className={styles.gridCard}>
          <Box p="0">
            <Text className={styles.titleCard}>{title}</Text>
          </Box>
          {secondaryText && (
            <Box paddingLeft="10px" margin="auto">
              <Link href="https://app.uniswap.org/#/add/v2/ETH/0x1f81f8f262714cc932141c7C79495B481eF27258?chain=mainnet" target="_blank">
                {secondaryText}
              </Link>
            </Box>
          )}
          <Spacer />
          <Box margin="auto" p="0">
            <Tooltip
              border=" 1px solid #E0E0E0"
              borderRadius="4px"
              boxShadow="none"
              padding="8px"
              fontSize="14px"
              bg="#fff"
              color="#656464"
              placement="top-end"
              label={labelTooltip}
            >
              <span>
                <Icon as={AiOutlineInfoCircle} w={10} h={10} color="#E0E0E0" />
              </span>
            </Tooltip>
          </Box>
        </Flex>
      )}
      <Box className={styles.tabsCard}>{children}</Box>
    </VStack>
  );
};
export default TabsCard;
