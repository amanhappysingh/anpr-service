import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarDemo } from "./components/SidebarComponent";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  return (
    <div className="flex h-full">
       <Toaster position="top-right" />
      <SidebarDemo outlet={<Outlet />} />
    </div>
  );
};

export default Layout;
