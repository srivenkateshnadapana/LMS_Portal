// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import \"@openzeppelin/contracts/token/ERC721/ERC721.sol\";
import \"@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol\";
import \"@openzeppelin/contracts/access/Ownable.sol\";
import \"@openzeppelin/contracts/utils/Counters.sol\";

/**
 * Soulbound NFT Certificate for LMS completion
 * Non-transferable (soulbound)
 */
contract CertNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => bool) public soulbound;  // Prevent transfers

    constructor(address initialOwner) ERC721(\"LMS Certificate\", \"LMS-CERT\") Ownable(initialOwner) {}

    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        soulbound[tokenId] = true;
        return tokenId;
    }

    // Soulbound: block transfers
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        require(!soulbound[tokenId], \"Soulbound: token non-transferable\");
        return super._update(to, tokenId, auth);
    }

    // Owner can burn if needed
    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    // Metadata URI for course details (IPFS/CID)
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
