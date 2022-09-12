import { Contract } from 'ethers';
import PolicyRulesAbi from '../abis/PolicyRules.json';
import { PolicyIngress } from '../@types/PolicyIngress';
import { PolicyRules } from '../@types/PolicyRules';

let instance: PolicyRules | null = null;

export const policyRulesFactory = async (ingressInstance: PolicyIngress) => {
  if (instance) return instance;

  const ruleContractName = await ingressInstance.functions.RULES_CONTRACT();
  console.log('POLICY CONTRACT NAME', ruleContractName);
  const policyRulesAddress2 = await ingressInstance.functions.getContractAddress(ruleContractName);
  const policyRulesAddress = '0x5B4f1d099017Db37Cd3c6635dDc2028312221243';

  console.log('POLICY ADDRESS', policyRulesAddress);
  console.log('POLICY ADDRESS2', policyRulesAddress2, ingressInstance);

  instance = new Contract(policyRulesAddress, PolicyRulesAbi.abi, ingressInstance.signer) as PolicyRules;
  return instance;
};
