import { Contract } from 'ethers';
import PolicyRulesAbi from '../abis/PolicyRules.json';
import { PolicyIngress } from '../@types/PolicyIngress';
import { PolicyRules } from '../@types/PolicyRules';

let instance: PolicyRules | null = null;

export const policyRulesFactory = async (ingressInstance: PolicyIngress) => {
  if (instance) return instance;

  const ruleContractName = await ingressInstance.functions.RULES_CONTRACT();
  const policyRulesAddress = await ingressInstance.functions.getContractAddress(ruleContractName);

  instance = new Contract(policyRulesAddress, PolicyRulesAbi.abi, ingressInstance.signer) as PolicyRules;
  return instance;
};
