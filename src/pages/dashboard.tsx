import Sidebar from "../components/ui/sidebar";
import SideBarPhone from "../components/ui/sidebarPhone";
import CashBoard from "../components/ui/remainingDashboard"
import DashboardTable from "../components/ui/userDashboard";

export default function Dashboard() {
    return(
        <>
        <div className="min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] h-[full]">
        <Sidebar/>
        <SideBarPhone/>
        <CashBoard/>
        
        <DashboardTable/>
        </div>
        </>
    )
}