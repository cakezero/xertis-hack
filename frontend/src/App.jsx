import './App.css'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import WalletConnect from './components/WalletConnect';
// import WhiteList from './components/WhiteList'

function App() {

  return (
    <ThirdwebProvider
      clientId={import.meta.env.VITE_CLIENT_ID}
      activeChain="polygon">
      <div className="nav-left">
        <img src="/vite.svg" alt="Xertis-logo" />
        <h2>Xertis</h2>
        <div className='fer'>
          <WalletConnect />
        </div>
      </div>

      <div>
        <h1>Hello</h1>
      </div>
    </ThirdwebProvider>
  );
}

export default App
