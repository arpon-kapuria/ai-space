import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function Layout() {
  return (
    <div className="flex h-full flex-col bg-void">
      <NavBar />
      <div className="relative flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
