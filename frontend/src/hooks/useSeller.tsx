import { useContext } from "react";
import SellerContext from "../context/SellerProvider.js";

const useSeller = () => {
    return useContext(SellerContext);
}

export default useSeller;