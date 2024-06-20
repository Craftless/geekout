import { axiosPrivateSeller } from '../api/axios.js';
import { useEffect } from 'react';
import useSeller from './useSeller.js';
import useRefreshTokenSeller from './useRefreshTokenSeller.js';

const useAxiosPrivateSeller = () => {
    const refresh = useRefreshTokenSeller();
    const { seller } = useSeller();

    useEffect(() => {

        const requestIntercept = axiosPrivateSeller.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${seller?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivateSeller.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivateSeller(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivateSeller.interceptors.request.eject(requestIntercept);
            axiosPrivateSeller.interceptors.response.eject(responseIntercept);
        }
    }, [seller, refresh])

    return axiosPrivateSeller;
}

export default useAxiosPrivateSeller