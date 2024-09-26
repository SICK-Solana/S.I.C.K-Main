import { TipLink } from '@tiplink/api';

// Create A New TipLink
TipLink.create().then(tiplink => {
  console.log("link: ", tiplink.url.toString());
  console.log("publicKey: ", tiplink.keypair.publicKey.toBase58());
  return tiplink;
});

// Get Public Key from TipLink
const getPublicKeyString = async (link_string: string) => {
  const tiplink = await TipLink.fromLink(tp);
  return tiplink.keypair.publicKey.toBase58();
};

const tp = 'https://tiplink.io/i#5jC3aFcBJR4g4BQ5D';
getPublicKeyString(tp).then((publicKeyString) => {
  console.log("publicKey (which can be used to fund the TipLink): ", publicKeyString);
});