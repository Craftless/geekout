import axios from "../api/axios.js";
import useCustomer from "./UseCustomer.js";

interface CustomerType {
  customer_id: string;
  accessToken: string;
  cart: Array<object>;
  username: string;
}

const useRefreshTokenCustomer = () => {
  const { setCustomer } = useCustomer();

  const refresh = async () => {
    const response = await axios.get("/refresh/customer", {
      withCredentials: true,
    });
    setCustomer((prev: CustomerType) => {
      return {
        ...prev,
        accessToken: response.data.accessToken,
        customer_id: response.data.customer_id,
        username: response.data.username,
        cart: {},
      };
    });
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshTokenCustomer;
