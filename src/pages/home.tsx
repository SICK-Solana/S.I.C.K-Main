import Sidebar from "../components/ui/sidebar";
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
export default function Home(){
    return (
        <>
        <div >
      {/* <WalletMultiButton className="absolute right-0 top-0"/> */}
        <Sidebar/>
        </div>
     
        </>
    )
}