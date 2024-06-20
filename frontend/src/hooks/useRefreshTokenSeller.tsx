import axios from '../api/axios.js';
import useSeller from './useSeller.js';

interface SellerType {
    seller_id: string;
    accessToken: string;
    shopName: string
}


const useRefreshTokenSeller = () => {
    const { setSeller } = useSeller();

const refresh = async () => {
        const response = await axios.get('/refresh/seller', {
            withCredentials: true
        });
        setSeller((prev: SellerType) => {
            return {
                ...prev,
                accessToken: response.data.accessToken,
                seller_id: response.data.seller_id,
                shopName: response.data.shop_name,
            }
        })
        return response.data.accessToken;
    }
    return refresh
}

export default useRefreshTokenSeller