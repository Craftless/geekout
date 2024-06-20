import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="max-w-7xl m-auto">
      <Outlet />
    </div>
  );
};

export default RootLayout;
