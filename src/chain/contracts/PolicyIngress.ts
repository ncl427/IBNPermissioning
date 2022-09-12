import { Contract, Signer } from 'ethers';
import { Provider } from 'ethers/providers';
import PolicyIngressAbi from '../abis/PolicyIngress.json';
import { PolicyIngress } from '../@types/PolicyIngress';
import { Config } from '../../util/configLoader';

let instance: PolicyIngress | null = null;

export const policyIngressFactory = async (config: Config, provider: Provider | Signer) => {
  if (instance) {
    return instance;
  }

  instance = new Contract(config.policyIngressAddress, PolicyIngressAbi.abi, provider) as PolicyIngress;
  console.log('POLICY INGRESS INSTANCE', instance, config.policyIngressAddress);

  return instance;
};
