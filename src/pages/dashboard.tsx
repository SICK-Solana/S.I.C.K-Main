// import { useEffect, useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
import CashBoard from "../components/ui/remainingDashboard"

export default function Dashboard() {
    // const { publicKey } = useWallet();
    // const [assets, setAssets] = useState<any>(null);
    // const [totalValue, setTotalValue] = useState<number>(0);

    // useEffect(() => {
    //     const fetchAssets = async () => {
    //         if (!publicKey) return;
            
    //         try {
    //             const response = await fetch(`https://lite-api.jup.ag/ultra/v1/balances/${publicKey.toString()}`);
    //             const data = await response.json();
    //             setAssets(data);
                
    //             // Calculate total portfolio value
    //             const total = Object.values(data).reduce((sum: number, token: any) => {
    //                 return sum + (token.uiAmount * (token.usdValue || 0));
    //             }, 0);
    //             setTotalValue(total);
    //         } catch (error) {
    //             console.error("Error fetching assets:", error);
    //         }
    //     };

    //     fetchAssets();
    // }, [publicKey]);

    return(
        <>
        <div className="min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] h-[full] pt-32">
            <CashBoard />
          
        </div>
        </>
    )
}