import { type Extrinsic, Builder } from '@paraspell/sdk';
import { type ApiPromise } from '@polkadot/api';
import type BigNumber from 'bignumber.js';
import type ExchangeNode from '../dexNodes/DexNode';
import { type TCommonTransferOptionsModified, type TTransferOptionsModified } from '../types';
import { validateRelayChainCurrency } from '../utils/utils';
import { submitTransaction } from '../utils/submitTransaction';

export const buildToExchangeExtrinsic = (
  api: ApiPromise,
  { from, exchange, currencyFrom, amount, injectorAddress }: TCommonTransferOptionsModified,
): Extrinsic => {
  const builder = Builder(api);
  if (from === 'Polkadot' || from === 'Kusama') {
    return builder.to(exchange).amount(amount).address(injectorAddress).build();
  }
  return builder
    .from(from)
    .to(exchange)
    .currency(currencyFrom)
    .amount(amount)
    .address(injectorAddress)
    .build();
};

export const buildFromExchangeExtrinsic = (
  api: ApiPromise,
  { to, exchange, currencyTo, recipientAddress: address }: TCommonTransferOptionsModified,
  amountOut: string,
): Extrinsic => {
  const builder = Builder(api);
  if (to === 'Polkadot' || to === 'Kusama') {
    return builder.from(exchange).amount(amountOut).address(address).build();
  }
  return builder
    .from(exchange)
    .to(to)
    .currency(currencyTo)
    .amount(amountOut)
    .address(address)
    .build();
};

export const submitSwap = async (
  api: ApiPromise,
  exchangeNode: ExchangeNode,
  options: TTransferOptionsModified,
  toDestTransactionFee: BigNumber,
  toExchangeTransactionFee: BigNumber,
): Promise<{ amountOut: string; txHash: string }> => {
  const { signer, injectorAddress } = options;
  const { tx, amountOut } = await exchangeNode.swapCurrency(
    api,
    options,
    toDestTransactionFee,
    toExchangeTransactionFee,
  );
  const txHash = await submitTransaction(api, tx, signer, injectorAddress);
  return { amountOut, txHash };
};

export const submitTransferToExchange = async (
  api: ApiPromise,
  options: TTransferOptionsModified,
): Promise<string> => {
  const { from, currencyFrom, signer, injectorAddress } = options;
  validateRelayChainCurrency(from, currencyFrom);
  const tx = buildToExchangeExtrinsic(api, options);
  return await submitTransaction(api, tx, signer, injectorAddress);
};

export const submitTransferToDestination = async (
  api: ApiPromise,
  options: TTransferOptionsModified,
  amountOut: string,
): Promise<string> => {
  const { to, currencyTo, signer, injectorAddress } = options;
  validateRelayChainCurrency(to, currencyTo);
  const tx = buildFromExchangeExtrinsic(api, options, amountOut);
  return await submitTransaction(api, tx, signer, injectorAddress);
};
