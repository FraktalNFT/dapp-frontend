/**
 * React
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
/**
 * Utils
 */
import { useWeb3Context } from "./Web3Context";

export const UserContext = createContext(null);

export const UserContextProviderFC = ({ children }) => {

  const [loading, setLoading] = useState<boolean>(false);
  const { account } = useWeb3Context();

  useEffect(() => {

  }, [account]);

  return (
    <UserContext.Provider value={{ loading}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const { loading } = useContext(UserContext);
  return {
    loading
  };
};