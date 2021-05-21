import { useState, useEffect } from "react";

const useMarketplace = () => {
  const [someState, setSomeState] = useState<{ key: string } | null>(null);
  
  useEffect(() => {
    console.log("Printing demo info");
  }, []);
}

export default useMarketplace; 
