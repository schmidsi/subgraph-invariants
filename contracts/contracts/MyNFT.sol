pragma solidity ^0.8.4;

import 'erc721a/contracts/ERC721A.sol';

contract MyNFT is ERC721A {
    constructor() ERC721A('My NFT', 'MYNFT') {}

    function mint(uint256 quantity) external {
        // `_mint`'s second argument now takes in a `quantity`, not a `tokenId`.
        _mint(msg.sender, quantity);
    }
}
