import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <div className="w-full flex h-full">
        <div className="hidden lg:block fixed top-0 left-0 h-full w-[264px] overflow-y-auto">
          <Sidebar />
        </div>

        <div className="flex-1 lg:pl-[264px] max-w-screen-2xl mx-auto">
          <Navbar />

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
