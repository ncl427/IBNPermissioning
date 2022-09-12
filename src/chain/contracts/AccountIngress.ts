import { Contract, Signer } from 'ethers';
import { Provider } from 'ethers/providers';
import AccountIngressAbi from '../abis/AccountIngress.json';
import { AccountIngress } from '../@types/AccountIngress';
import { Config } from '../../util/configLoader';

let instance: AccountIngress | null = null;

export const accountIngressFactory = async (config: Config, provider: Provider | Signer) => {
  if (instance) return instance;
  console.log('ACCOUNT INGRESS INSTANCE', instance, config.policyIngressAddress);

  instance = new Contract(config.accountIngressAddress, AccountIngressAbi.abi, provider) as AccountIngress;
  return instance;
};
