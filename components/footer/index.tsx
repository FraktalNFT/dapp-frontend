import { Image } from "@chakra-ui/image";
import { Text, Link, Container, Box } from "@chakra-ui/layout";
import { Heading, Flex, Icon, List, ListItem } from "@chakra-ui/react";
import TwitterIcon from "../icon/TwitterIcon";
import InstagramIcon from "../icon/InstagramIcon";
import DiscordIcon from "../icon/DiscordIcon";
import MediumIcon from '../icon/MediumIcon';

const urlLists = [
  {
    title: "Resources",
    items: [
      { text: "Blog", url: "https://blog.fraktal.io/" },
      { text: "Docs", url: "https://docs.fraktal.io/" },
      { text: "Audit", url: "" }
    ]
  },
  {
    title: "Get Involved",
    items: [
      { text: "Stake", url: "" },
      { text: "DAO", url: "https://docs.fraktal.io/fraktal-dao/overview" },
      { text: "Github", url: "https://github.com/FraktalNFT" },
    ]
  },
  {
    title: "Need Help?",
    items: [
      { text: "How it Works", url: "" },
      { text: "Tutorials", url: "" },
      { text: "Support", url: "https://discord.gg/B9atrdtEEx" }
    ]
  }
]

const socials = [
  { url: "https://twitter.com/fraktalnft", icon: TwitterIcon },
  { url: "https://www.instagram.com/fraktal.io/", icon: InstagramIcon },
  { url: "https://discord.gg/B9atrdtEEx", icon: DiscordIcon },
  // { url: "https://youtube.com", icon: InstagramIcon },
  { url: "https://blog.fraktal.io/", icon: MediumIcon }
]

const Footer: React.FC = () => {
  return (
    <Container 
      maxW={["100%", "38.4rem", "96.4rem"]}
      py="15rem"
      pt={["15rem", "30rem"]}
    >
      <Flex direction={["column", "column", "row", "row"]} justify="space-between">
        <Box alignItems="start" flex={["1 1", "1 1", "1 1", "0.5 1"]} mr="15rem">
          <Image src="/fraktal-full-logo.png" w={["100%", "320px"]}/>
          <Text fontSize={16} my="40px" lineHeight="30px" fontWeight={500} color="grey.500">
            Fraktal is a community first project, with a mission to to empower 
            artists to be in full control of their work and have unlimited 
            creative freedom.
          </Text>

          <Box>
            <Heading textAlign="center" mb="2rem">Follow Us!</Heading>
            <Flex direction="row" justify="space-evenly" gap={16} mb="4rem">
              {socials.map(({url, icon}, idx) => (
                <Link href={url} isExternal rel="noreferrer noopener" key={`social-${idx}`}>
                  <Icon as={icon} w="32px" h="32px" />
                </Link>
              ))}
            </Flex>
          </Box>
          <Text fontSize={10}>
            © Fraktal Technologies Ltd.
          </Text>
        </Box>
        

      {urlLists.map(({title, items}, idx) => (
        <Flex direction="column" key={`footer-list-${idx}`}>
        <Heading as="h6" variant="footer">{title}</Heading>
        <List>
          {items.map(({url, text}, lidx) => (
            <ListItem key={`footer-${idx}-${lidx}`}>
              <Link
                  href={url}
                  isExternal
                  rel="noreferrer noopener"
                  display="flex"
                  alignItems="center"
                >                
                <Text as="span" variant="footer">{text}</Text>
              </Link>
            </ListItem>
          ))}
        </List>
      </Flex>
      ))}
      </Flex>
    </Container>
  );
};

export default Footer;