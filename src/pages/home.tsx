import { SideBarPhone } from "../components/ui/sidebarPhone";
import CryptoDashboard from "../components/ui/remaining";
import Sidebar from "../components/ui/sidebar";

export default function Home(){
    return (
        <div className="flex flex-col md:flex-row w-full">
        <Sidebar/>
        <CryptoDashboard/>
        <SideBarPhone/>
        </div>
    )
}