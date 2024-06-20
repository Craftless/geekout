import { axiosPrivateCustomer } from '../api/axios.js';
import { useEffect } from 'react';
import useRefreshTokenCustomer from './useRefreshTokenCustomer.js';
import useCustomer from './UseCustomer.js';

const useAxiosPrivateCustomer = () => {
    const refresh = useRefreshTokenCustomer();
    const { customer } = useCustomer();


    useEffect(() => {

        const requestIntercept = axiosPrivateCustomer.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${customer?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivateCustomer.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivateCustomer(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivateCustomer.interceptors.request.eject(requestIntercept);
            axiosPrivateCustomer.interceptors.response.eject(responseIntercept);
        }
    }, [customer, refresh])

    return axiosPrivateCustomer;
}

export default useAxiosPrivateCustomer