import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { MyNFT, Transfer as TransferEvent } from '../generated/MyNFT/MyNFT';
import { Account, Token, Transfer } from '../generated/schema';

const ZERO_ADDRESS = Address.fromString(
  '0x0000000000000000000000000000000000000000',
);

function getOrCreateAccount(address: Address): Account {
  let id = address;
  let account = Account.load(id);

  if (!account) {
    account = new Account(id);
    account.balance = BigInt.fromI32(0);
    account.save();
  }

  return account;
}

function getOrCreateToken(tokenId: BigInt): Token {
  let id = changetype<Bytes>(Bytes.fromBigInt(tokenId));
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);
    token.owner = ZERO_ADDRESS;
    token.save();
  }

  return token;
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  let from = getOrCreateAccount(event.params.from);
  let to = getOrCreateAccount(event.params.to);
  let token = getOrCreateToken(event.params.tokenId);

  entity.from = from.id;
  entity.to = to.id;
  entity.token = token.id;

  if (from.id != ZERO_ADDRESS) {
    from.balance = from.balance.minus(BigInt.fromI32(1));

    // Invariant: Balance should never be negative
    assert(from.balance >= BigInt.fromI32(0), 'Negative balance');
    from.save();
  }

  if (to.id != ZERO_ADDRESS) {
    to.balance = to.balance.plus(BigInt.fromI32(1));

    // Check periodically if balance retrieved via eth_call (slow) matches the computed balance
    if (event.block.number.mod(BigInt.fromI32(2)).equals(BigInt.fromI32(0))) {
      let instance = MyNFT.bind(event.address);
      let balance = instance.balanceOf(Address.fromBytes(to.id));
      assert(
        balance == to.balance,
        'Balance mismatch between eth_call and computed balance',
      );
    }

    to.save();
  }

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  token.owner = to.id;

  token.save();
  entity.save();
}
