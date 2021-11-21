import { Box } from "@chakra-ui/react";

export default function ArtistCard(props) {
  return (
    <>
      <Box
        sx={{
          height: `250px`,
          width: `250px`,
          borderRadius: `50%`,
          backgroundImage: `url(${props.bg})`,
          backgroundRepeat: `no-repeat`,
          backgroundPosition: `center`,
          backgroundSize: `cover`,
        }}
      ></Box>
    </>
  );
}
