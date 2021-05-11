import { HStack, StackProps, Text } from "@chakra-ui/layout";
import { MouseEventHandler, useState } from "react";
import FrakButton from "../button";

const Pagination: React.FC<
  StackProps & {
    pageCount: number;
    handlePageClick: (pageNumber: number) => void;
  }
> = ({ pageCount, handlePageClick, ...props }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
    const pageNumber = parseInt((e.target as HTMLButtonElement).textContent);
    setCurrentPage(pageNumber);
    handlePageClick(pageNumber);
  };

  return (
    <HStack spacing=".8rem" {...props}>
      {Array.from({ length: pageCount })
        .slice(0, 3)
        .map((_, index) => (
          <FrakButton
            key={`page-${index + 1}`}
            boxSizing="border-box"
            isOutlined={currentPage === index + 1}
            rounded="full"
            width="4rem"
            height="4rem"
            py=".8rem"
            className="semi-16"
            onClick={handleClick}
          >
            {index + 1}
          </FrakButton>
        ))}
      {pageCount > 5 && (
        <>
          <Text color="black.900">...</Text>
          <FrakButton
            boxSizing="border-box"
            isOutlined={currentPage === pageCount}
            rounded="full"
            width="4rem"
            height="4rem"
            py=".8rem"
            className="semi-16"
            onClick={handleClick}
          >
            {pageCount}
          </FrakButton>
        </>
      )}
    </HStack>
  );
};

export default Pagination;
