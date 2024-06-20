import { ReactNode } from "react";

const SideNavLinks = ({ children }: { children: ReactNode }) => {
  return (
    <ul className="w-full h-full flex flex-col mt-4 pl-4 space-y-4 text-xl">
      {children}
    </ul>
  );
};

export default SideNavLinks;
