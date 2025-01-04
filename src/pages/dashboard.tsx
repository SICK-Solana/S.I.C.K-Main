
import CashBoard from "../components/ui/remainingDashboard"
import DashboardTable from "../components/ui/userDashboard";

export default function Dashboard() {
    return(
        <>
        <div className="min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] h-[full]">
      
        <CashBoard/>
        <DashboardTable/>
        </div>
        </>
    )
}