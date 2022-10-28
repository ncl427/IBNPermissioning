import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PolicyRules } from '../chain/@types/PolicyRules';
import { policyRulesFactory } from '../chain/contracts/PolicyRules';
import { useNetwork } from './network';
import { BigNumber, BigNumberish } from 'ethers/utils';

//import BigNumber from 'bignumber.js'

type Policy = {
  policyId: string;
  //policyRoles: string;
  //policyService: string;
  policyProvider: string;
  hashedInfo: string;
};
//type Policy = { hashedInfo: string, enrolled: boolean };

type ContextType =
  | {
      policyList: Policy[];
      setPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
      serviceList: string[];
      setServiceList: React.Dispatch<React.SetStateAction<string[]>>;
      roleList: string[];
      setRoleList: React.Dispatch<React.SetStateAction<string[]>>;
      policyReadOnly?: boolean;
      setPolicyReadOnly: React.Dispatch<React.SetStateAction<boolean | undefined>>;
      policyRulesContract?: PolicyRules;
      setPolicyRulesContract: React.Dispatch<React.SetStateAction<PolicyRules | undefined>>;
    }
  | undefined;

const PolicyDataContext = createContext<ContextType>(undefined);

// //LOADS the HAshed policy and enrolled status from the Blockchain

const loadPolicyData = (
  policyRulesContract: PolicyRules | undefined,
  setPolicyList: (policy: Policy[]) => void,
  setServiceList: (type: string[]) => void,
  setRoleList: (type: string[]) => void,
  setPolicyReadOnly: (readOnly?: boolean) => void,
  //admin?: boolean
) => {
  if (policyRulesContract === undefined) {
    setPolicyList([]);
    setServiceList([]);
    setRoleList([]);
    setPolicyReadOnly(undefined);
  } else {
    policyRulesContract.functions.isReadOnly().then(isReadOnly => setPolicyReadOnly(isReadOnly));
    policyRulesContract.functions.policiesSize().then(listSize => {
      const listElementsPromises: Promise<BigNumber>[] = [];
      let listHashPromises: Promise<any>[] = [];
      let listHashPromises2: Promise<any>[] = [];

      for (let i = 0; listSize.gt(i); i++) {
        listElementsPromises.push(policyRulesContract.functions.getPolicyByIndex(i));
      }
      Promise.all(listElementsPromises).then(responses1 => {
        listHashPromises = responses1.map(policyId => policyRulesContract.functions.getFullPolicyById(policyId));
        //setPolicyList(responses1.map(address => ({ address })));
        console.log('HASHEDInfoPol: ', listHashPromises);

        Promise.all(listHashPromises).then(async responses2 => {
          setPolicyList(
            responses2.map((policy, i) => {
              const idobject: Policy = {
                policyId: '',
                //policyRoles: '',
                //policyService: '',
                policyProvider: '',
                hashedInfo: ''
              };
              idobject.policyId = responses1[i].toString();
              //idobject.policyRoles = JSON.stringify(policy.policyRoles.map(String));
              //idobject.policyService = policy.policyService.toString();;
              idobject.policyProvider = policy.policyProvider;
              idobject.hashedInfo = policy.hashedInfo;
              console.log('POLICY', idobject);
              return idobject;
            })
          );

          //For getting the Service Names per each policy
          Promise.all(
            responses2.map(type => {
              let result: Promise<string> = policyRulesContract.functions
                .getFullServiceById(type.policyService)
                .then(result => {
                  return result.serviceName;
                });
              return result;
            })
          ).then(response3 => {
            //console.log("NAAAAAAAAAAAAAAAAAAAMMMMMEEEESSS111", JSON.stringify(response3) )
            setServiceList(response3);
          });

          //For getting the Role Names per each policy

          listHashPromises2 = responses2.map(policy => {
            let result: Promise<any>[] = [];

            result = policy.policyRoles.map((roleId: BigNumberish) => {
              let result2: Promise<string> = policyRulesContract.functions.getFullRoleById(roleId).then(result3 => {
                return result3.roleName;
              });
              return result2;
            });

            const mapResult = Promise.all(result).then(result4 => {
              //console.log("DEBUGROLELIST", JSON.stringify(result4.map(String)) );
              return JSON.stringify(result4.map(String));
            });

            return mapResult;
          });

          // const  promise4all = await Promise.all(
          //   listHashPromises2.map(function(innerPromiseArray) {
          //        return Promise.all(innerPromiseArray);
          //   })
          // );
          Promise.all(listHashPromises2).then(finalList => {
            console.log('DEBUGROLELIST2', finalList);
            setRoleList(finalList);
          });
        });
      });
    });
  }
};

/**
 * Provider for the data context that contains the policy list
 * @param {Object} props Props given to the PolicyDataProvider
 * @return The provider with the following value:
 *  - policyList: list of permitted policies from Policy Rules contract
 *  - setPolicyList: setter for the allowlist state
 */
export const PolicyDataProvider: React.FC<{}> = props => {
  const [policyList, setPolicyList] = useState<Policy[]>([]);
  const [roleList, setRoleList] = useState<string[]>([]);
  const [serviceList, setServiceList] = useState<string[]>([]);
  const [policyReadOnly, setPolicyReadOnly] = useState<boolean | undefined>(undefined);
  const [policyRulesContract, setPolicyRulesContract] = useState<PolicyRules | undefined>(undefined);

  const value = useMemo(
    () => ({
      policyList: policyList,
      setPolicyList: setPolicyList,
      roleList: roleList,
      setRoleList: setRoleList,
      serviceList: serviceList,
      setServiceList: setServiceList,
      policyReadOnly,
      setPolicyReadOnly,
      policyRulesContract,
      setPolicyRulesContract
    }),
    [
      policyList,
      setPolicyList,
      roleList,
      setRoleList,
      serviceList,
      setServiceList,
      policyReadOnly,
      setPolicyReadOnly,
      policyRulesContract,
      setPolicyRulesContract
    ]
  );

  const { policyIngressContract } = useNetwork();

  useEffect(() => {
    if (policyIngressContract === undefined) {
      setPolicyRulesContract(undefined);
    } else {
      policyRulesFactory(policyIngressContract).then(contract => {
        setPolicyRulesContract(contract);
        contract.removeAllListeners('PolicyAdded');
        contract.removeAllListeners('PolicyRemoved');
        contract.removeAllListeners('PolicyUpdated');
        contract.on('PolicyAdded', (success, policy, event) => {
          if (success) {
            loadPolicyData(contract, setPolicyList, setServiceList, setRoleList, setPolicyReadOnly);
            //console.log("LIST: ", policyList);
          }
        });
        contract.on('PolicyUpdated', (success, policy, event) => {
          if (success) {
            loadPolicyData(contract, setPolicyList, setServiceList, setRoleList, setPolicyReadOnly);
            //console.log("LIST: ", policyList);
          }
        });
        contract.on('PolicyRemoved', (success, policy, event) => {
          if (success) {
            loadPolicyData(contract, setPolicyList, setServiceList, setRoleList, setPolicyReadOnly);
          }
        });
      });
    }
  }, [policyIngressContract, setPolicyList, setServiceList, setRoleList, setPolicyReadOnly]);

  return <PolicyDataContext.Provider value={value} {...props} />;
};

/**
 * Fetch the appropriate policy data on chain and synchronize with it
 * @return {Object} Contains data of interest:
 *  - dataReady: true if isReadOnly and policy allowlist are correctly fetched,
 *  false otherwise
 *  - userAddress: Address of the user
 *  - isReadOnly: Policy contract is lock or unlock,
 *  - allowlist: list of permitted policies from Policy contract,
 */
export const usePolicyData = (admin : boolean) => {
  const context = useContext(PolicyDataContext);

  if (!context) {
    throw new Error('usePolicyData must be used within an PolicyDataProvider.');
  }

  const {
    policyList,
    setPolicyList,
    policyReadOnly,
    setPolicyReadOnly,
    serviceList,
    setServiceList,
    roleList,
    setRoleList,
    policyRulesContract
  } = context;
  //console.log("AAADDMMMIN: ", admin);
  
  useEffect(() => {
  
    loadPolicyData(policyRulesContract, setPolicyList, setServiceList, setRoleList, setPolicyReadOnly);
  
  }, [admin, policyRulesContract, setPolicyList, setPolicyReadOnly]);
  

  const formattedPolicyList = useMemo(() => {
    return policyList
      .map((policy, i) => ({
        ...policy,
        identifier: policy.policyId.toString(),
        policyService: serviceList[i],
        policyRoles: roleList[i],

        status: 'active'
      }))
      .reverse();
  }, [policyList, serviceList, roleList]);
  console.log('POLICYLIST1---------------: ', formattedPolicyList);

  const dataReady = useMemo(() => {
    return policyRulesContract !== undefined && policyReadOnly !== undefined && policyList !== undefined;
  }, [policyRulesContract, policyReadOnly, policyList, serviceList, roleList]);

  return {
    dataReady,
    allowlist: formattedPolicyList,
    isReadOnly: policyReadOnly,
    policyRulesContract
  };
};
