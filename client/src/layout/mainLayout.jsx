import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";

import {
  MdSpaceDashboard,
  MdInventory2,
  MdPeopleAlt,
  MdReceiptLong,
  MdPayments,
  MdAssessment,
} from "react-icons/md";
import { TbBuildingWarehouse, TbArrowsExchange } from "react-icons/tb";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: MdSpaceDashboard, end: true },
  { to: "/products", label: "Products", icon: MdInventory2 },
  { to: "/godowns", label: "Godowns", icon: TbBuildingWarehouse },
  { to: "/stock-transfers", label: "Stock Transfers", icon: TbArrowsExchange },
  { to: "/parties", label: "Parties", icon: MdPeopleAlt },
  { to: "/transactions", label: "Transactions", icon: MdReceiptLong },
  { to: "/payments", label: "Payments", icon: MdPayments },
  { to: "/reports/outstanding", label: "Outstanding Reports", icon: MdAssessment },
];

const MainLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar  */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 flex flex-col gap-6 transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition duration-300 z-50`}
      >
        <h1 className="text-xl font-bold tracking-tight px-2">
          Inventory Manager
        </h1>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content  */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Mobile  */}
        <div className="md:hidden p-3 bg-gray-900 text-white flex justify-between items-center">
          <h1 className="font-semibold">Inventory Manager</h1>
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl leading-none px-1"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Page Content  */}
        <div className="flex-1 bg-gray-100 p-3 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
