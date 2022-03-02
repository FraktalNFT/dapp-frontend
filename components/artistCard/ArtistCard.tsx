import { Box, StackProps } from "@chakra-ui/react"
import { forwardRef } from "react"

interface ArtistCardProps extends StackProps {
  bg: string;
}

const ArtistCard = forwardRef<HTMLDivElement, ArtistCardProps>((props, ref) => {
  return (
    <>
      <Box
        ref={ref}
        sx={{
          height: `250px`,
          width: `250px`,
          borderRadius: `50%`,
          backgroundImage: `url(${props.bg})`,
          backgroundRepeat: `no-repeat`,
          backgroundPosition: `center`,
          backgroundSize: `cover`,
          transition: `all 0.25s`,
        }}
        onClick={props.onClick}
        _hover={{
            transform: `translateY(-6px)`
        }}
      ></Box>
    </>
  )
})

export default ArtistCard
