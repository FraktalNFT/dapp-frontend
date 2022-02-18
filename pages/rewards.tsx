/**
 * REACT
 */
import {useEffect, useState} from "react";
/**
 * NEXT
 */
import { useRouter } from "next/router";
/**
 * CHAKRA UI
 */
import {
    Box,
    Center,
    Flex,
    Stack,
    StackDivider,
    Tab,
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    HStack,
    VStack,
    Text
} from '@chakra-ui/react'
/**
 * FRAKTAL Components
 */
import FrakButton from "@/components/button";
import FrakButton2 from "@/components/button2";
import TabsCard from "@/components/tabsCard";

/**
 * STYLES
 */
import styles from "@/styles/rewards.module.css";
/**
 * Countdown
 */
import Countdown, {zeroPad} from 'react-countdown';
/**
 * Rewards
 * @returns {any}
 * @constructor
 */
const RewardsPage = () => {
    const router = useRouter();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    tomorrow.setHours(24, 0, 0, 0);

    return (
        <VStack spacing={55}>
            <VStack spacing={5}>
                <Box>
                    <h2 className="fraktalHeading">Total FRAK in Wallet</h2>
                </Box>
                <Box>
                    <h4 className="fraktalHeading">This page is not functional on testnet.</h4>
                </Box>
                <Box>
                    <HStack spacing={10} divider={<StackDivider borderColor='#9F66E3' />}>
                        <Box><Text className="fraktalTotal">1 000 000.00 FRAK</Text></Box>
                        <Box>
                            <a href={"https://app.uniswap.org/"} target="_blank">
                                <FrakButton px="50px">Buy Frak</FrakButton>
                            </a>
                        </Box>
                    </HStack>
                </Box>
            </VStack>
            <Box>
                <Stack direction={['column', 'row']} spacing={30}>
                    <Staking totalStaked={50.00} unclaimedRewards={0.1}/>
                    <Trading unclaimedRewards={0} nextDistribution={tomorrow}/>
                    <LiquidityPool totalStaked={0} unclaimedRewards={0}/>
                </Stack>
            </Box>
            <Box>
                <a href={"https://docs.fraktal.io/fraktal-governance-token-frak/airdrop"} target="_blank">
                    <FrakButton
                        color="#000"
                        border="2px solid #000"
                        px="50px"
                        background="#ffffff"
                    >Learn more</FrakButton>
                </a>
            </Box>
        </VStack>
    );
};

const StakePanels = ({totalStaked, currency}) => {
    const [isReadyToStake, setStakeIsReady] = useState(false);
    const [isReadyToUnstake, setUnstakeIsReady] = useState(false);

    const stake = () => {
        //TODO - Add Stake contract method
        alert("Stake");
    };

    const onSetAmountToStake = (d) => {
        if (d > 0 && parseInt(d)) {
            return setStakeIsReady(true);
        }
        return setStakeIsReady(false);
    };

    const unstake = () => {
        //TODO - Add Unstake contract method
        alert("Unstake");
    };

    const onSetAmountToUnstake = (d) => {
        if (d > 0 && parseInt(d) && d <= totalStaked) {
            return setUnstakeIsReady(true);
        }
        return setUnstakeIsReady(false);
    };

    return (
        <Tabs size='lg' align="center" >
            <TabList borderBottom="1px solid #E0E0E0" className={styles.tabButtons}>
                <Tab _selected={{ color: '#985CFF', borderColor:  '#985CFF'}} >Stake</Tab>
                <Tab _selected={{ color: '#985CFF', borderColor:  '#985CFF'}}>Unstake</Tab>
            </TabList>
            <TabPanels padding="0 10px" margin="28px 0 0 0">
                <TabPanel>
                    <FrakButton2
                        setFunction={onSetAmountToStake}
                        onClick={stake}
                        isReady={isReadyToStake}
                        currency={currency}
                    >Stake</FrakButton2>
                </TabPanel>
                <TabPanel>
                    <FrakButton2
                        setFunction={onSetAmountToUnstake}
                        onClick={unstake}
                        isReady={isReadyToUnstake}
                        currency={currency}>Unstake</FrakButton2>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};

/**
 * Staking Component
 * @returns {any}
 * @constructor
 */
const Staking = ({totalStaked, unclaimedRewards}) => {
    const currency = 'FRAK';
    return (
        <TabsCard
            labelTooltip="Deposit your FRAK and start earning ETH from transaction fees. Unstake at any time."
            title="Staking">
            <StakePanels  totalStaked={totalStaked} currency={currency}/>
            <VStack className={styles.stackedContainer} spacing={10} divider={<StackDivider borderColor='#E0E0E0' />}>
                <VStack spacing={5}>
                    <Staked
                        currency={currency}
                        token={totalStaked}
                        apy={(totalStaked/unclaimedRewards).toFixed(2)}/>
                </VStack>
                <VStack spacing={5}>
                    <ClaimRewards currency="ETH" unclaimedRewards={unclaimedRewards}/>
                </VStack>
            </VStack>
        </TabsCard>
    );
};

/**
 * Trading
 * @returns {any}
 * @constructor
 */
const Trading = ({unclaimedRewards, nextDistribution}) => {
    const currency = 'FRAK';

    const countdown = ({ hours, minutes}) => {
        return (
            <Text className={styles.countdown}>
                {zeroPad(hours)}:{zeroPad(minutes)}
            </Text>
       )
    };

    return (
        <TabsCard
            labelTooltip="Earn FRAK based on your trading volume to offset gas costs."
            title="Trading">
            <Box className={styles.cardTitle}>
                Next Distribution in
            </Box>
            <VStack className={styles.stackedContainer} spacing={10} divider={<StackDivider borderColor='#E0E0E0' />}>
                <VStack margin="auto" spacing={5}>
                    <Flex>
                        <Center height="200px">
                            <VStack>
                                <Box>
                                    <Text className={styles.hoursMinutes}>HOURS:MINUTES</Text>
                                </Box>
                                <Box>
                                    <Countdown date={nextDistribution} renderer={countdown}/>
                                </Box>
                            </VStack>
                        </Center>
                    </Flex>
                </VStack>
                <VStack spacing={5}>
                    <ClaimRewards currency={currency} unclaimedRewards={0}/>
                </VStack>
            </VStack>
        </TabsCard>
    );
};

/**
 * Liquidity Pool
 * @returns {any}
 * @constructor
 */
const LiquidityPool = ({totalStaked, unclaimedRewards}) => {
    const currency = 'LPT';

    return (
        <TabsCard
            secondaryText="Add/Remove Liquidity"
            labelTooltip="Provide liquidity in the ETH/FRAK pool on uniswap v2 and stake your LP tokens to earn FRAK."
            currency={currency}
            title="LP">
            <StakePanels totalStaked={totalStaked} currency={currency}/>
            <VStack className={styles.stackedContainer} spacing={10} divider={<StackDivider borderColor='#E0E0E0' />}>
                <VStack spacing={5}>
                  <Staked
                      currency="LP Tokens"
                      token={0}
                      apy={56.21}/>
                </VStack>
                <VStack spacing={5}>
                    <ClaimRewards currency={'ETH'} unclaimedRewards={unclaimedRewards}/>
                </VStack>
            </VStack>
        </TabsCard>
    );
};

const Staked = ({apy, token, currency}) => {
    return (
        <>
            <Box>
                <Text className={styles.stakedText}>STAKED</Text>
            </Box>
            <Box>
                <Text className={styles.stakedQuantity}>{token} {currency}</Text>
            </Box>
            <Box>
                <Text className={styles.apr}>{apy}% APY</Text>
            </Box>
        </>
    );
};
const ClaimRewards = ({currency, unclaimedRewards}) => {

    const claimReward = () => {
        //TODO - Add Claiming Reward contract method
        alert("Claiming Rewards");
    };

    return (
        <>
            <Box>
                <Text className={styles.stakedText}>Unclaimed rewards</Text>
            </Box>
            <Box>
                <Text className={styles.stakedQuantity}>{unclaimedRewards} {currency}</Text>
            </Box>
            <Box>
                <FrakButton onClick={claimReward} disabled={unclaimedRewards==0} px="70px">Claim Rewards</FrakButton>
            </Box>
        </>
    );
};
export default RewardsPage;
