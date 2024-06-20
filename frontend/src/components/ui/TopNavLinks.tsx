import { ReactNode } from "react";

const TopNavLinks = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex justify-center items-center space-x-2">{children}</div>
  );
};

export default TopNavLinks;
