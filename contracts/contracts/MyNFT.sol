pragma solidity ^0.8.4;

import 'erc721a/contracts/ERC721A.sol';

/*
Note:
This is a purposefully buggy NFT contract.
DO NOT USE THIS IN PRODUCTION.
*/

contract MyNFT is ERC721A {
    constructor() ERC721A('My NFT', 'MYNFT') {}

    function mint(uint256 quantity) external {
        _mint(msg.sender, quantity);
    }

    function balanceOf(address owner) public view override returns (uint256) {
        // Stupid but possible
        return 0;
    }
}
