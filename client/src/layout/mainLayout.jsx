import { Link, Outlet, NavLink } from "react-router-dom";
import { useState } from "react";

const MainLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {open && (
        <div
          className="fixed inset-0 bg-opacity-30 md:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar  */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-60 bg-gray-900 text-white p-4 space-y-4 transform 
          ${open ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition duration-300 z-50`}
      >
        <h1 className="text-xl font-bold"> Inventory Manager</h1>

        <nav className="space-y-2">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-1 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-1 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/parties"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-1 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Parties
          </NavLink>
          <NavLink
            to="/transactions"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-1 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Transactions
          </NavLink>
          <NavLink
            to="/reports/outstanding"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-1 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Outstanding Reports
          </NavLink>
        </nav>
      </div>

      {/* Main Content  */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar Mobile  */}
        <div className="md:hidden p-3 bg-gray-800 text-white flex justify-between items-center">
          <h1 className="font-semibold">Inventory</h1>
          <button onClick={() => setOpen(!open)}>☰</button>
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
