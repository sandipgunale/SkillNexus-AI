import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Outlet />
    </div>
  );
}

export default PublicLayout;