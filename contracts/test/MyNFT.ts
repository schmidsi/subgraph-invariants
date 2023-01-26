import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('MyNFT', function() {
  async function deployFixture() {
    const [alice, bob] = await ethers.getSigners();

    const MyNFT = await ethers.getContractFactory('MyNFT');
    const myNFT = await MyNFT.deploy();

    return { myNFT, alice, bob };
  }

  describe('Deployment', function() {
    it('should start with totalSupply == 0', async function() {
      const { myNFT } = await loadFixture(deployFixture);

      expect(await myNFT.totalSupply()).to.equal(0);
    });

    it('can mint multiple', async function() {
      const { myNFT, alice } = await loadFixture(deployFixture);

      await expect(myNFT.mint(2)).to.emit(myNFT, 'Transfer');

      expect(await myNFT.totalSupply()).to.equal(2);

      // This is the bug in the contract
      expect(await myNFT.balanceOf(alice.address)).to.equal(0);
    });
  });
});
