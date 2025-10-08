import { Outlet } from "react-router-dom";

export default function MarketingLayout() {
  return (
    <div className="bg-[var(--vb-gray-50)] dark:bg-[var(--vb-gray-50)] min-h-screen">
      <Outlet />
    </div>
  );
}
