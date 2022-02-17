
import NextLink from "next/link";
const Anchor = ({ href, passHref, target, children }) => {
    return (
        <NextLink href={href}  >
            <a href={href} target={target} >
                {children}
            </a>
        </NextLink>
    )
}
export default Anchor;