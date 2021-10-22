import { useState } from 'react';
import { Image } from "@chakra-ui/image";
import { Box, StackProps, Text, VStack, BoxProps } from "@chakra-ui/layout";
import React, { forwardRef } from "react";
import { Flex, Spacer, forwardRef as fRef, HTMLChakraProps, chakra } from "@chakra-ui/react";
import { FrakCard } from "../../types";
import {motion, isValidMotionProp, HTMLMotionProps} from "framer-motion"

interface NFTItemProps extends StackProps {
  item: FrakCard;
  name: String;
  amount: Number;
  price: Number;
  imageURL: String;
  CTAText?: string;
}

// idk typescript but apparently I have to do this
type Merge<P, T> = Omit<P, keyof T> & T;
type ShadowBoxProps = Merge<HTMLChakraProps<"div">, HTMLMotionProps<"div">>;
const ShadowBox: React.FC<ShadowBoxProps> = motion(chakra.div);

const NFTItem = forwardRef<HTMLDivElement, NFTItemProps>(
	({ item, amount, price, imageURL, name, onClick, CTAText }, ref) => {
		
		const [isVisible, setIsVisible] = useState(false);
		
		const onImageLoad = (ms: number) => {
			setTimeout(() => {
				setIsVisible(true);
			}, ms);
		}

		const visibleStyle = { opacity: `1`};
		const inVisibleStyle = { opacity: `0` };
		const visibleAnimRepeat = 1
		const inVisibleAnimRepeat = Infinity;

		return (
			<>
			<ShadowBox
				w='30rem'
				rounded='md'
				borderWidth='1px'
				onClick={onClick}
				_hover={{
					boxShadow: "xl"
				}}	
					animate={{
						boxShadow: ['0px 0px 8px #888888', '0px 0px 24px #888888', '0px 0px 8px #888888'],
					}}
					transition={{
						duration: 4,
						times: [0, 0.5, 0],
						ease: "linear",
						repeat: (isVisible) ? visibleAnimRepeat : inVisibleAnimRepeat,
						repeatType: "loop",
						repeatDelay: 0,
					}}
				// ref={ref}
				>
				<VStack
					cursor='pointer'
				>
					<Box
						h='35rem'
						w='100%'
						position='relative'
						sx={(isVisible) ? visibleStyle : inVisibleStyle /* toggle visibility */} 
						>
							<Image
								src={imageURL}
								width='100%'
								height='100%'
								objectFit='cover'
								margin-left='auto'
								margin-right='auto'
								display='flex'
								sx={{
									objectFit: `cover`
								}}
								style={{ verticalAlign: 'middle' }}
								onLoad={() => onImageLoad(4000)}
							/>

					</Box>
				</VStack>
				<Box margin="1rem">
					<Text className='semi-16' mb='1rem'>
						{name}
					</Text>
					<Flex>
						{amount &&
							<Text className='medium-12'>
								{amount / 100}% Available
							</Text>
						}

						<Spacer />
						<Image align="vertical" width="5" height="8" marginEnd="3px" src="https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/31987/eth-diamond-black.png" />
						{price &&
							<Text textAlign="end" className='medium-12'>
								{Math.round(price * 100000) / 100000}
							</Text>
						}
					</Flex>
				</Box>
			</ShadowBox>
				
	</>
    );
  }
);

export default NFTItem;
