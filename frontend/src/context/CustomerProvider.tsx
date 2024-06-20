import { createContext, useState } from "react";

interface CustomerContextValue {
    customer: any;
    setCustomer: React.Dispatch<React.SetStateAction<any>>;
}

const CustomerContext = createContext<CustomerContextValue>({
    customer: {},
    setCustomer: () => { },
});

interface CustomerProviderProps {
    children: React.ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
    const [customer, setCustomer] = useState<any>({});
    return (
        <CustomerContext.Provider value={{ customer, setCustomer }}>
            {children}
        </CustomerContext.Provider>
    );
};

export default CustomerContext;
