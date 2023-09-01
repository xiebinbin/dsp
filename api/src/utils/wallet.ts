import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { bytesToHex, hexToBytes } from 'ethereum-cryptography/utils';
import { Web3Account } from 'web3-eth-accounts';
import Web3 from 'web3';

const web3 = new Web3();

export class Wallet {
  protected account: Web3Account;
  protected priKey: string;

  constructor(priKey: string) {
    if (priKey.substring(0, 2) != '0x') {
      priKey = '0x' + priKey;
    }
    this.priKey = priKey;
    this.account = web3.eth.accounts.privateKeyToAccount(priKey);
  }

  getPubKey(): string {
    return bytesToHex(
      secp256k1.getPublicKey(hexToBytes(this.account.privateKey), true),
    );
  }

  sign(content: string): string {
    return this.account.sign(content).signature;
  }

  verifySign(content: string, sign: string): boolean {
    return web3.eth.accounts.recover(content, sign) == this.getAddress();
  }

  getAddress(): string {
    return this.account.address;
  }

  getPriKey(): string {
    if (this.priKey.substring(0, 2) == '0x') {
      return this.priKey.substring(2);
    }
    return this.priKey;
  }

  getSharedSecret(pubKey: string): string {
    if (pubKey.substring(0, 2) == '0x') {
      pubKey = pubKey.substring(2);
    }
    return bytesToHex(
      secp256k1.getSharedSecret(hexToBytes(this.account.privateKey), pubKey),
    ).substring(2);
  }
}

export const GenerateKey = (): string => {
  return web3.eth.accounts.create().privateKey.substring(2);
};
