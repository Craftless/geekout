import { useContext } from "react";
import CustomerContext from "../context/CustomerProvider";

const useCustomer = () => {
    return useContext(CustomerContext);
}

export default useCustomer;