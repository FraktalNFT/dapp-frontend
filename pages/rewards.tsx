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

import {
    lpStakingHarvest,lpStakingWithdraw,lpStakingDeposit,lpStakingCalculateRewards, lpStakingUserInfo,
    tradingRewardsCanClaim, tradingRewardsClaim,
    feeSharingDeposit, feeSharingHarvest,feeSharingWithdraw, feeSharingCalculatePendingRewards,feeSharingUserInfo,
    erc20BalanceOf, erc20Allowance, erc20Approve
} from '@/utils/contractCalls'
import { useWeb3Context } from '../contexts/Web3Context';
import {utils} from 'ethers';

/**
 * Rewards
 * @returns {any}
 * @constructor
 */
const RewardsPage = () => {
    const router = useRouter();
    const { account, provider, lpStakingAddress, tradingRewardsAddress, feeSharingAddress, fraktalTokenAddress, lpTokenAddress, loading} = useWeb3Context();

    const [frakBalance,setFrakBalance] = useState("0");
    const [stakedFrak,setStakedFrak] = useState("0");
    const [unclaimedFrakStaking, setUnclaimedFrakStaking]= useState("0");
    const [unclaimedTradingRewards, setUnclaimedTradingRewards]= useState("0");
    const [tradingRewardsAmount, setTradingRewardsAmount] = useState("0");
    const [tradingRewardsMerkle, setTradingRewardsMerkle] = useState(null);
    const [lpBalance,setLPBalance] = useState("0");
    const [stakedLP, setStakedLP] = useState("0");
    const [unclaimedLPStaking,setUnclaimedLP] = useState("0");
    const [refresh,setRefresh] = useState(false);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    tomorrow.setHours(24, 0, 0, 0);

    useEffect(() => {
        async function getData(){
            if(!loading && account ){
                const balance = (await erc20BalanceOf(account,provider,fraktalTokenAddress));
                const _feeSharingUserInfo = await feeSharingUserInfo(account,provider,feeSharingAddress);
                const _stakedFrak = utils.formatEther(_feeSharingUserInfo[0]);
                const _unclaimedFrakStaking = utils.formatEther(await feeSharingCalculatePendingRewards(account,provider,feeSharingAddress));
                let _unclaimedTradingRewards = "0";
                if(tradingRewardsMerkle){
                    _unclaimedTradingRewards = await tradingRewardsCanClaim(account,tradingRewardsAmount,tradingRewardsMerkle,provider,tradingRewardsAddress);
                }
                _unclaimedTradingRewards = utils.formatEther(_unclaimedTradingRewards);

                const _lpBalance = utils.formatEther(await erc20BalanceOf(account,provider,lpTokenAddress));
                const _lpStakingUserInfo = await lpStakingUserInfo(account,provider,lpStakingAddress);
                const _stakedLp = utils.formatEther(_lpStakingUserInfo[0]);
                const _lpPendingRewards = utils.formatEther(await lpStakingCalculateRewards(account,provider,lpStakingAddress));

                setFrakBalance(utils.formatEther(balance));
                setStakedFrak(_stakedFrak)
                setUnclaimedFrakStaking(_unclaimedFrakStaking);
                setUnclaimedTradingRewards(_unclaimedTradingRewards);
                setLPBalance(_lpBalance);
                setStakedLP(_stakedLp);
                setUnclaimedLP(_lpPendingRewards);
            }
        }


        getData();
    },[loading,account])

    return (
        <VStack spacing={55}>
            <VStack spacing={5}>
                <Box>
                    <h2 className="fraktalHeading">Total FRAK in Wallet</h2>
                </Box>
                <Box>
                    <HStack spacing={10} divider={<StackDivider borderColor='#9F66E3' />}>
                        <Box><Text className="fraktalTotal">{frakBalance} FRAK</Text></Box>
                        <Box>
                            <a href={"https://app.uniswap.org/#/swap?outputCurrency=0x1f81f8f262714cc932141c7C79495B481eF27258&chain=mainnet"} target="_blank">
                                <FrakButton px="50px">Buy Frak</FrakButton>
                            </a>
                        </Box>
                    </HStack>
                </Box>
            </VStack>
            <Box>
                <Stack direction={['column', 'row']} spacing={30}>
                    <Staking totalStaked={stakedFrak} unclaimedRewards={unclaimedFrakStaking}
                    provider={provider} feeSharingAddress={feeSharingAddress}
                    account={account} fraktalTokenAddress={fraktalTokenAddress}
                    />
                    <Trading unclaimedRewards={unclaimedTradingRewards} nextDistribution={tomorrow}
                    provider={provider} account={account} tradingRewardsAddress={tradingRewardsAddress}
                    tradingRewardsAmount={tradingRewardsAmount} tradingRewardsMerkleProof={tradingRewardsMerkle}
                    />
                    <LiquidityPool totalStaked={stakedLP} unclaimedRewards={unclaimedLPStaking}
                    provider={provider}
                    account={account}
                    lpStakingAddress={lpStakingAddress} lpTokenAddress={lpTokenAddress}
                    />
                </Stack>
            </Box>
            <Box>
                <a href={"https://docs.fraktal.io/fraktal-governance-token-frak/staking-frak"} target="_blank">
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

const StakePanels = ({totalStaked, currency, provider, account,
    feeSharingAddress, fraktalTokenAddress,
    lpStakingAddress, lpTokenAddress
}) => {
    const [isReadyToStake, setStakeIsReady] = useState(false);
    const [isReadyToUnstake, setUnstakeIsReady] = useState(false);
    const [stakeAmount,setStakeAmount] = useState(0);
    const [unstakeAmount,setUnstakeAmount] = useState(0);

    const stake = async () => {
        //TODO - Add Stake contract method
        if(currency==="FRAK"){
            const allowance = await erc20Allowance(account,feeSharingAddress, provider, fraktalTokenAddress);
            if(allowance==0){
                await erc20Approve(feeSharingAddress,provider,fraktalTokenAddress);
            }
            const formattedAmount = utils.parseEther(stakeAmount.toString());
            await feeSharingDeposit(formattedAmount.toString(),false,provider,feeSharingAddress);
        }
        if(currency==="LPT"){
            const allowance = await erc20Allowance(account,lpStakingAddress, provider, lpTokenAddress);
            if(allowance==0){
                await erc20Approve(lpStakingAddress,provider,lpTokenAddress);
            }
            const formattedAmount = utils.parseEther(stakeAmount.toString());
            await lpStakingDeposit(formattedAmount.toString(),provider,lpStakingAddress);
        }

    };

    const onSetAmountToStake = (d) => {
        if (d > 0 && parseInt(d)) {
            setStakeAmount(d);
            return setStakeIsReady(true);
        }
        return setStakeIsReady(false);
    };

    const unstake = async () => {
        //TODO - Add Unstake contract method
        if(currency==="FRAK"){
            const formattedAmount = utils.parseEther(unstakeAmount.toString());
            await feeSharingWithdraw(formattedAmount.toString(),false,provider,feeSharingAddress);
        }
        if(currency==="LPT"){
            const formattedAmount = utils.parseEther(unstakeAmount.toString());
            await lpStakingWithdraw(formattedAmount.toString(),provider,lpStakingAddress);
        }
    };

    const onSetAmountToUnstake = (d) => {
        if (d > 0 && parseInt(d) && d <= totalStaked) {
            console.log(d);

            setUnstakeAmount(d);
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
const Staking = ({totalStaked, unclaimedRewards, provider, feeSharingAddress, account, fraktalTokenAddress}) => {
    const currency = 'FRAK';
    return (
        <TabsCard
            labelTooltip="Deposit your FRAK and start earning ETH from transaction fees. Unstake at any time."
            title="Staking">
            <StakePanels  totalStaked={totalStaked} currency={currency}
            account={account} provider={provider} feeSharingAddress={feeSharingAddress}
            fraktalTokenAddress={fraktalTokenAddress}
            lpStakingAddress={""} lpTokenAddress={""}
            />
            <VStack className={styles.stackedContainer} spacing={10} divider={<StackDivider borderColor='#E0E0E0' />}>
                <VStack spacing={5}>
                    <Staked
                        currency={currency}
                        token={totalStaked}
                        apy={"500"}/>
                </VStack>
                <VStack spacing={5}>
                    <ClaimRewards currency="ETH" unclaimedRewards={unclaimedRewards}
                    type={"staking"} provider={provider} feeSharingAddress={feeSharingAddress}
                    lpStakingAddress={""} tradingRewardsAddress={""}
                    tradingRewardsAmount={""} tradingRewardsMerkleProof={""}
                    />
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
const Trading = ({unclaimedRewards, nextDistribution, account ,provider, tradingRewardsAddress, tradingRewardsAmount, tradingRewardsMerkleProof}) => {
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
                    <ClaimRewards currency={currency} unclaimedRewards={unclaimedRewards}
                    provider={provider}
                    type={"trading"} tradingRewardsAddress={tradingRewardsAddress} lpStakingAddress={""} feeSharingAddress={""}
                    tradingRewardsAmount={tradingRewardsAmount} tradingRewardsMerkleProof={tradingRewardsMerkleProof}
                    />
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
const LiquidityPool = ({totalStaked, unclaimedRewards,account, provider, lpStakingAddress, lpTokenAddress}) => {
    const currency = 'LPT';

    return (
        <TabsCard
            secondaryText="Add/Remove Liquidity"
            labelTooltip="Provide liquidity in the ETH/FRAK pool on uniswap v2 and stake your LP tokens to earn FRAK."
            currency={currency}
            title="LP">
            <StakePanels totalStaked={totalStaked} currency={currency}
            account={account} provider={provider} fraktalTokenAddress={""} feeSharingAddress={""}
            lpStakingAddress={lpStakingAddress} lpTokenAddress={lpTokenAddress}
            />
            <VStack className={styles.stackedContainer} spacing={10} divider={<StackDivider borderColor='#E0E0E0' />}>
                <VStack spacing={5}>
                  <Staked
                      currency="LP Tokens"
                      token={totalStaked}
                      apy={56.21}/>
                </VStack>
                <VStack spacing={5}>
                    <ClaimRewards currency={'FRAK'} unclaimedRewards={unclaimedRewards}
                    provider={provider}
                    type={"lp"} tradingRewardsAddress={""} lpStakingAddress={lpStakingAddress} feeSharingAddress={""}
                    tradingRewardsAmount={""} tradingRewardsMerkleProof={""}
                    />
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
const ClaimRewards = ({currency, unclaimedRewards, type, provider, feeSharingAddress, tradingRewardsAddress, tradingRewardsAmount, tradingRewardsMerkleProof, lpStakingAddress}) => {

    const claimReward = async () => {
        //TODO - Add Claiming Reward contract method
        if(type === "staking"){
            await feeSharingHarvest(provider, feeSharingAddress);
        }
        if(type === "trading"){
            await tradingRewardsClaim(tradingRewardsAmount, tradingRewardsMerkleProof, provider, tradingRewardsAddress);
        }
        if(type === "lp"){
            await lpStakingHarvest(provider,lpStakingAddress)
            console.log("Claim LP");

        }
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
