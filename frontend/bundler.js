import { ethers } from 'ethers';

const connect = async () => {
  if (typeof window.ethereum !== "undefned") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    const account = await ethereum.request({ method: "eth_accounts" });
    if (account.length === 1) {
      document.getElementById(
        "button"
      ).innerHTML = `Connected to ${account[0]}`;
    } else {
      document.getElementById("button").innerHTML = "Connected";
    }
  } else {
    alert("Please install metamask");
  }
};

const whiteList = async () => {
  const form = document.querySelector('form');
  const addys = form.addys.value;
  const ids = form.ids.value; 
  if (!addys && !ids) {
    alert('form fields cannot be empty!');
  } else if (!ids){
    alert('Token id field must be filled!')
  } else if (!addys){
    alert('Wallet address field must be filled!')
  } else {
    if (typeof window.ethereum !== 'undefined') {
      const contractAddress = '';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        await contract.addWhiteList(addys, ids);
      } catch (error) {
        alert('error')
      }
    } else {
      alert("Please install metamask");
    }
  }
};