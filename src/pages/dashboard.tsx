import Sidebar from "../components/ui/sidebar";
import SideBarPhone from "../components/ui/sidebarPhone";
import CashBoard from "../components/ui/remainingDashboard"

export default function Dashboard() {
    return(
        <div className="flex flex-col md:flex-row w-full">
        <Sidebar/>
        <SideBarPhone/>
        <CashBoard/>
        </div>
    )
}
