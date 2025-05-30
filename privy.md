Setup
​
Prerequisites
Before you begin, make sure you have set up your Privy app and obtained your app ID from the Privy Dashboard.

Deploying your app across multiple domains or environments? Learn how to use app clients to customize Privy’s behavior for different environments.

​
Initializing Privy
In your project, import the PrivyProvider component and wrap your app with it. The PrivyProvider must wrap any component or page that will use the Privy React SDK, and it is generally recommended to render it as close to the root of your application as possible.

If you’re new to React and using contexts, check out these resources!

Ethereum
Solana

NextJS

Create React App

Copy
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import {PrivyProvider} from '@privy-io/react-auth';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId="your-privy-app-id"
      clientId="your-app-client-id"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
To use external Solana wallets, you must pass toSolanaWalletConnectors() to the externalWallets prop in your PrivyProvider config. Learn more here.

​
Configuration
The PrivyProvider component accepts the following props:

​
appId
stringrequired
Your Privy App ID. You can find this in the Privy Dashboard.

​
clientId
string
(Optional) A client ID to be used for this app client. Learn more about app clients here.

​
config
Object
Configuration options for the Privy SDK.

For more information on the config object, look under React > Advanced for guides like customizing appearance for our UI components and configuring networks.

​
Waiting for Privy to be ready
When the PrivyProvider is first rendered on your page, the Privy SDK will initialize some state about the current user. This might include checking if the user has a wallet connected, refreshing expired auth tokens, fetching up-to-date user data, and more.

It’s important to wait until the PrivyProvider has finished initializing before you consume Privy’s state and interfaces, to ensure that the state you consume is accurate and not stale.

To determine whether the Privy SDK has fully initialized on your page, check the ready Boolean returned by the usePrivy hook. When ready is true, Privy has completed initialization, and your app can consume Privy’s state and interfaces.


Copy
import {usePrivy} from '@privy-io/react-auth';

function YourComponent() {
  const {ready} = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  // Now it's safe to use other Privy hooks and state
  return <div>Privy is ready!</div>;
}




Quickstart
Learn how to authenticate users, create embedded wallets, and send transactions in your React app

​
0. Prerequisites
This guide assumes that you have completed the Setup guide.

​
1. Enable a user to log in via email
This quickstart guide will demonstrate how to authenticate a user with a one time password as an example, but Privy supports many authentication methods. Explore our Authentication docs to learn about other methods such as socials, passkeys, and external wallets to authenticate users in your app.

To authenticate a user via their email address, use the React SDK’s useLoginWithEmail hook.


Copy
import {useLoginWithEmail} from '@privy-io/react-auth';
...
const {sendCode, loginWithCode} = useLoginWithEmail();
Ensure that this hook is mounted in a component that is wrapped by the PrivyProvider. You can use the returned methods sendCode and loginWithCode to authenticate your user per the instructions below.

​
Send an OTP
Send a one-time passcode (OTP) to the user’s email by passing their email address to the sendCode method returned from useLoginWithEmail:


Copy
import {useState} from 'react';
import {useLoginWithEmail} from '@privy-io/react-auth';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const {sendCode, loginWithCode} = useLoginWithEmail();

  return (
    <div>
      <input onChange={(e) => setEmail(e.currentTarget.value)} value={email} />
      <button onClick={() => sendCode({email})}>Send Code</button>
      <input onChange={(e) => setCode(e.currentTarget.value)} value={code} />
      <button onClick={() => loginWithCode({code})}>Login</button>
    </div>
  );
}
​
2. Create an embedded wallet for the user
Your app can configure Privy to automatically create wallets for your users as part of their login flow. The embedded wallet will be generated and linked to the user object upon authentication.

Alternatively your app can manually create wallets for users when required.

Privy can provision wallets for your users on both Ethereum and Solana.
​
3. Send a transaction with the embedded wallet
EVM
Solana
With the users’ embedded wallet, your application can now prompt the user to sign and send transactions.


Copy
import {useSendTransaction} from '@privy-io/react-auth/solana';
import {Connection, Transaction, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL} from '@solana/web3.js';

export default function SendTransactionButton() {
  const {sendTransaction} = useSendTransaction();
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  // Create a new transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey('RECIPIENT_ADDRESS_HERE'),
      lamports: 0.1 * LAMPORTS_PER_SOL
    })
  );

  const onSendTransaction = async () => {
    sendTransaction({
      transaction,
      connection
    });
  }

  return <button onClick={onSendTransaction}>Send Transaction</button>;

}
Learn more about sending transactions with the embedded wallet. Privy enables you to take many actions on the embedded wallet, including send a transaction, sign a message, and sign a transaction.

Congratulations, you have successfully been able to integrate Privy authentication and wallet into your React application!



Automatic wallet creation
If your app uses embedded wallets, you can configure Privy to create wallets automatically for your users as part of their login flow.

Automatic embedded wallet creation is currently not supported if your app uses Privy’s whitelabel login interfaces. If this is the case for your app, you must manually create embedded wallets for your users at the desired point in your onboarding flow.

Ethereum
Solana
Ethereum & Solana
To configure Privy to automatically create embedded wallets for your user when they login, set the config.embeddedWallets.solana.createOnLogin property of your PrivyProvider:


Copy
<PrivyProvider
    appId="your-privy-app-id"
    config={{
        embeddedWallets: {
            solana: {
                createOnLogin: 'users-without-wallets',
            },
        },
    }}
>
    {children}
</PrivyProvider>
​
createOnLogin
'all-users' | 'users-without-wallets' | 'off'default:"off"
Determines when to create a wallet for the user.

'all-users': Create a wallet for all users on login.
'users-without-wallets': Create a wallet for users who do not have a wallet on login.
'off': Do not create a wallet on login.