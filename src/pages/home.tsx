import CryptoDashboard from "../components/ui/remaining";
import Sidebar from "../components/ui/sidebar";

export default function Home(){
    return (
        <div className="flex flex-row w-full">
        <Sidebar/>
        <CryptoDashboard/>
        </div>
    )
}