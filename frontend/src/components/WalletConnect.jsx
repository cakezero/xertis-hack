import { ConnectWallet } from '@thirdweb-dev/react'
// import "./css/WalletConnect.css";

export default function WalletConnect() {
  return (
    <ConnectWallet switchToActiveChain={true} />
  )
}
