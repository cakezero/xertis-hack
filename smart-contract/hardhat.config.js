require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    url: `${API_KEY}`,
    accounts: [`0x${PRIVATE_KEY}`]
  }
};
