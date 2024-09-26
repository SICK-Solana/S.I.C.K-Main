import { TipLink } from '@tiplink/api';
import {
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Connection,
} from '@solana/web3.js';

const TIPLINK_SOL_ONLY_LINK_MINIMUM_LAMPORTS = 1000000000;

const fundTipLink = async (sourceKeypair : Keypair, destinationTipLink : TipLink) => {

  const isValidAddress = await PublicKey.isOnCurve(destinationTipLink.keypair.publicKey);
  if(!isValidAddress) {
    throw "Invalid TipLink";
  }

  let transaction = new Transaction();
 
  let  connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a95e3765-35c7-459e-808a-9135a21acdf6', 'confirmed');


  transaction.add(
    SystemProgram.transfer({
      fromPubkey: sourceKeypair.publicKey,
      toPubkey: destinationTipLink.keypair.publicKey,
      lamports: TIPLINK_SOL_ONLY_LINK_MINIMUM_LAMPORTS,
    }),
  );

  const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [sourceKeypair], {commitment: "confirmed"});
  if (transactionSignature === null) {
    throw "Unable to fund TipLink's public key";
  }
  return transactionSignature;
};