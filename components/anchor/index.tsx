import NextLink from "next/link";

const defaultProps = {
    passHref: "",
    target: "_self"
}

const Anchor = ({ href, passHref, target, children }) => {
    return (
        <NextLink href={href}  >
            <a href={href} target={target} >
                {children}
            </a>
        </NextLink>
    )
};

Anchor.defaultProps = defaultProps
export default Anchor;