import Sidebar from "../components/ui/sidebar";
import SideBarPhone from "../components/ui/sidebarPhone";
import CashBoard from "../components/ui/remainingDashboard"
import DashboardTable from "../components/ui/userDashboard";

export default function Dashboard() {
    return(
        <>
        <div className="min-h-screen bg-gradient-to-b from-[#111817] to-[#070C14] ">
        <Sidebar/>
        <SideBarPhone/>
        <CashBoard/>
        
        <DashboardTable/>
        </div>
        </>
    )
}
