import { GoogleViaTipLinkWalletName } from '@tiplink/wallet-adapter'
import { useWallet } from '@solana/wallet-adapter-react'

export function GoogleWallet() {
	const { select, connect } = useWallet();
	
	// call this function upon button click
	async function loginViaTipLink() {
    select(GoogleViaTipLinkWalletName)
		await connect();
	}
}