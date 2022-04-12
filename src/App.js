import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import abi from './utils/CustomisedNFT.json'
import { ethers } from 'ethers';

// Constants
const TWITTER_HANDLE = 'kushagra_shiv';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/assets/mumbai';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = '0x412F111cb4F53a8E215105336411fF4Cc1A11cF0';
const ABI = abi.abi;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [firstWord, setFirstWord] = useState("");
  const [secondWord, setSecondWord] = useState("");
  const [thirdWord, setThirdWord] = useState("");
  const [color, setColor] = useState("");
  const [minting, setMinting] = useState(false);

  const checkIfWalletIsConnected = async() => {
    const {ethereum} = window;
    if(!ethereum) {
      console.log("Make sure you have metamask");
      return;
    }
    console.log("We have an ethereum object", ethereum);
    const accounts = await ethereum.request({method: "eth_accounts"});
    const chainId = await ethereum.request({method: "eth_chainId"});
    const mumbaiChainId = "0x13881";
    if(chainId !== mumbaiChainId) {
      alert("You are not connected to mumbai testnet!");
      return;
    }
    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized ethereum account", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized accounts found!");
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if(!ethereum) {
        alert("get metamask!");
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      const chainId = await ethereum.request({method: "eth_chainId"});
      const mumbaiChainId = "0x13881";
      if(chainId !== mumbaiChainId) {
        alert("You are not connected to mumbai testnet!");
        return;
      }
      console.log("Connected:", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (err) {
      console.log(err);
    }
  }

  const setupEventListener = async () => {
    try {
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        nftContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey! We've minted your NFT and sent it to your wallet! It can take a little while to show up on OpenSea. Here's the link: ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        })
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const askContractToMintNFT = async () => {
    try {
      setMinting(true);
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        console.log("Going to pop wallet not to pay gas!");

        let txn = await nftContract.makeAnEpicNFT(firstWord, secondWord, thirdWord, color);
        console.log("mining...");
        await txn.wait();
        console.log(`mined! see txn at https://mumbai.polygonscan.com/tx/${txn.hash}`);
        setMinting(false);
      } else {
        alert("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {checkIfWalletIsConnected()}, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Mint Hero Name</p>
          <p className="sub-text">
            Mint your unique three-word name NFT today.
          </p>
          {currentAccount === "" ?
            (renderNotConnectedContainer())
            :
            <>
              <div className='input-div'>
                <input className='name-inputs' type='text' placeholder='First Word' value={firstWord} onChange={(e) => setFirstWord(e.target.value)} />
                <input className='name-inputs' type='text' placeholder='Second Word' value={secondWord} onChange={(e) => setSecondWord(e.target.value)} />
                <input className='name-inputs' type='text' placeholder='Third Word' value={thirdWord} onChange={(e) => setThirdWord(e.target.value)} />
                <label>Background Color 👇</label>
                <input className='name-inputs' type='color' value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">{minting ? "Minting..." : "Mint NFT"}</button>
              <div>
                <a className='collection-link' href='https://testnets.opensea.io/collection/squarenft-rqowymvjcv' target='_blank'><button className='cta-button connect-wallet-button link-button'>View collection</button></a>
              </div>
            </>
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
