// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Xertis is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    mapping (address => bool) public whiteList;
    mapping (address => uint256) private tokenIdMapping;
    mapping (uint256 => bool) private tokenIdExists;

    string public tokenBaseURI;
    string public uriSuffix = ".json";

    uint256 public totalMints;

    event Minted(address minter);

    error canNotSendToken();
    error notWhiteListed(address phony);
    error tokenIdDoesNotBelongToYou();
    error tokenIdDoesNotExist();

    constructor (string memory _tokenName, string memory _tokenSymbol) ERC721(_tokenName, _tokenSymbol) {}

    function mint (uint256 tokenId) external whiteListed {
        if (tokenId != tokenIdMapping[_msgSender()]) revert tokenIdDoesNotBelongToYou();

        _safeMint(_msgSender(), tokenId);
        tokenIdExists[tokenId] = true;
        totalMints += 1;
        emit Minted(_msgSender());
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        if (from != address(0)) revert canNotSendToken();
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        if (!tokenIdExists[tokenId]) revert tokenIdDoesNotExist();
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        uriSuffix
                    )
                )
                : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return tokenBaseURI;
    }

    function setTokenBaseURI(string memory _tokenBaseURI) external onlyOwner {
        tokenBaseURI = _tokenBaseURI;
    }
    
    modifier whiteListed () {
        if (!whiteList[_msgSender()]) revert notWhiteListed(_msgSender());
        _;
    }


    // Required Solidity overrides

    function burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
