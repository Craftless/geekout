import { createContext, useState } from "react";

interface SellerContextValue {
    seller: any;
    setSeller: React.Dispatch<React.SetStateAction<any>>;
}

const SellerContext = createContext<SellerContextValue>({
    seller: {},
    setSeller: () => { },
});

interface SellerProviderProps {
    children: React.ReactNode;
}

export const SellerProvider: React.FC<SellerProviderProps> = ({ children }) => {
    const [seller, setSeller] = useState<any>({});
    return (
        <SellerContext.Provider value={{ seller, setSeller }}>
            {children}
        </SellerContext.Provider>
    );
};

export default SellerContext;
