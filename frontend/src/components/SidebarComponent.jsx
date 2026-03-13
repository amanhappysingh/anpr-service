import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/Sidebar";
import logo_img from "../../public/12345.jpeg";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmojiTransportation } from "react-icons/md";
import { IoVideocamSharp } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { IoMdSettings } from "react-icons/io";
import { RiLogoutCircleLine } from "react-icons/ri";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconUserBolt,
  IconUserCircle,
} from "@tabler/icons-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { logout } from "@/features/auth/authSlice";
import Modal from "./Modal";
import { MdDashboard } from "react-icons/md";

export function SidebarDemo({ outlet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case "/app/dashboard":
        return "Dashboard";
      case "/app/logs":
        return "Logs";
      case "/app/all-vechiles":
        return "All Vehicles";
      case "/app/live-streaming":
        return "Streaming";
      case "/app/reports":
        return "Reports";
      case "/app/configuration":
        return "Configuration";
      default:
        return (
          <div className="flex w-fit gap-1 justify-between items-center my-2"></div>
        );
    }
  };

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <MdDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logs",
      href: "logs",

      icon: (
        <MdEmojiTransportation className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "All Vechiles",
      href: "all-vechiles",

      icon: (
        <MdEmojiTransportation className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Live Views",
      href: "live-streaming",

      icon: (
        <IoVideocamSharp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Reports",
      href: "reports",
      icon: (
        <TbReportSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Configuration",
      href: "configuration",
      icon: (
        <IoMdSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-col md:flex-row bg-white dark:bg-neutral-900 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-500 overflow-hidden h-full",
        )}
      >
        <Sidebar open={open} setOpen={setOpen} animate={false}>
          <SidebarBody className="justify-between gap-8">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <Logo />
              <hr className="h-[1px] bg-gray-700 mb-2 " />
              <div className=" flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={{
                      label: link.label,
                      href: link.href,
                      icon: link.icon,
                    }}
                    action={link.action}
                  />
                ))}
              </div>
            </div>
            <div>
              <SidebarLink
                action={() => setModalOpen(true)}
                link={{
                  label: "Logout",

                  icon: (
                    <RiLogoutCircleLine className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="flex relative no-scrollbar border flex-col flex-1 overflow-hidden">
          <Header header={getHeaderTitle()} />
          <div className="flex-1 no-scrollbar overflow-y-auto">{outlet}</div>
          <div className="fixed bottom-4 text-2xl font-bold right-4 pointer-events-none select-none text-red-500 dark:text-yellow-400 opacity-50">
            Amperevision Solution
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Logout"
        size="sm"
        showCloseButton={true}
        closeOnBackdrop={true}
        closeOnEscape={true}
      >
        <div className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export const Logo = () => {
  return (
    <Link
      to="/"
      className="flex flex-col w-full  items-center text-sm text-black   z-20"
    >
      <div className="flex w-full my-2 justify-center items-center">
        <img src={logo_img} alt="" className="h-full w-[40%]" />
      </div>
      <div className="flex w-fit gap-1 justify-between items-center my-2">
        <FaLocationDot />
        <p className="text-red-500 font-bold">Adity Birla Group</p>
      </div>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
