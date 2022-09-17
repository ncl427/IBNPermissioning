import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PolicyRules } from '../chain/@types/PolicyRules';
import { policyRulesFactory } from '../chain/contracts/PolicyRules';
import { useNetwork } from './network';
import { BigNumber } from 'ethers/utils';

//import BigNumber from 'bignumber.js'

type Policy = {
  policyId: BigNumber;
  policyRoles: BigNumber[];
  policyService: BigNumber;
  policyProvider: string;
  hashedInfo: string;
};
//type Policy = { hashedInfo: string, enrolled: boolean };

type ContextType =
  | {
      policyList: Policy[];
      setPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
      //hashList: Policy[];
      //setHashList: React.Dispatch<React.SetStateAction<Policy[]>>;
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
  setPolicyReadOnly: (readOnly?: boolean) => void
) => {
  if (policyRulesContract === undefined) {
    setPolicyList([]);
    setPolicyReadOnly(undefined);
  } else {
    policyRulesContract.functions.isReadOnly().then(isReadOnly => setPolicyReadOnly(isReadOnly));
    policyRulesContract.functions.policiesSize().then(listSize => {
      const listElementsPromises: Promise<BigNumber>[] = [];
      let listHashPromises: Promise<any>[] = [];
      for (let i = 0; listSize.gt(i); i++) {
        listElementsPromises.push(policyRulesContract.functions.getPolicyByIndex(i));
      }
      Promise.all(listElementsPromises).then(responses1 => {
        listHashPromises = responses1.map(policyId => policyRulesContract.functions.getFullPolicyById(policyId));
        //setPolicyList(responses1.map(address => ({ address })));
        console.log('HASHEDInfoPol: ', listHashPromises);

        Promise.all(listHashPromises).then(responses2 => {
          // const zip = (a1: any[],a2: { [x: string]: any; }) => a1.map((x, i) => [x,a2[i]]);
          // const listpolicies = zip(responses1, responses2)
          //console.log("HASHEDInfo: ", listpolicies );
          setPolicyList(
            responses2.map((policy, i) => {
              const idobject: Policy = {
                policyId: new BigNumber(0),
                policyRoles: [new BigNumber(0)],
                policyService: new BigNumber(0),
                policyProvider: '',
                hashedInfo: ''
              };
              idobject.policyId = responses1[i];
              idobject.policyRoles = policy.policyRoles;
              idobject.policyService = policy.policyService;
              idobject.policyProvider = policy.policyProvider;
              idobject.hashedInfo = policy.hashedInfo;
              console.log('POLICY', idobject);
              return idobject;
            })
          );
        });
      });
    });
  }
};

//  const loadExtraData = (
//    policyRulesContract: PolicyRules | undefined,
//    setHashList: (policy: Policy[]) => void) => {
//    if (policyRulesContract === undefined) {
//      setHashList([]);
//    } else {
//      policyRulesContract.functions.getSize().then(listSize => {
//        const listElementsPromises : Promise<string>[] = [];
//        let listHashPromises : Promise<any>[] = [];
//        for (let i = 0; listSize.gt(i); i++) {
//          listElementsPromises.push(policyRulesContract.functions.getByIndex(i));
//        }
//        Promise.all(listElementsPromises).then(responses => {
//          console.log("Info: ", listElementsPromises );
//          listHashPromises = responses.map(address =>  policyRulesContract.functions.getFullByAddress(address) );
//          Promise.all(listHashPromises).then(responses => {
//           console.log("HASHEDInfo: ", listHashPromises );
//           setHashList(responses.map(policy => {
//              const idobject: Policy = {hashedInfo: '', enrolled: false};
//              idobject.enrolled = policy.enrolled;
//              idobject.hashedInfo = policy.hashedInfo;
//             return idobject;
//           } ));
//         });
//        });

//      });
//    }
//  };

/**
 * Provider for the data context that contains the policy list
 * @param {Object} props Props given to the PolicyDataProvider
 * @return The provider with the following value:
 *  - policyList: list of permitted policies from Policy Rules contract
 *  - setPolicyList: setter for the allowlist state
 */
export const PolicyDataProvider: React.FC<{}> = props => {
  const [policyList, setPolicyList] = useState<Policy[]>([]);
  //const [hashList, setHashList] = useState<Policy[]>([]);
  const [policyReadOnly, setPolicyReadOnly] = useState<boolean | undefined>(undefined);
  const [policyRulesContract, setPolicyRulesContract] = useState<PolicyRules | undefined>(undefined);

  const value = useMemo(
    () => ({
      policyList: policyList,
      setPolicyList: setPolicyList,
      policyReadOnly,
      setPolicyReadOnly,
      policyRulesContract,
      setPolicyRulesContract
    }),
    [policyList, setPolicyList, policyReadOnly, setPolicyReadOnly, policyRulesContract, setPolicyRulesContract]
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
            loadPolicyData(contract, setPolicyList, setPolicyReadOnly);
            //console.log("LIST: ", policyList);
          }
        });
        contract.on('PolicyUpdated', (success, policy, event) => {
          if (success) {
            loadPolicyData(contract, setPolicyList, setPolicyReadOnly);
            //console.log("LIST: ", policyList);
          }
        });
        contract.on('PolicyRemoved', (success, policy, event) => {
          if (success) {
            loadPolicyData(contract, setPolicyList, setPolicyReadOnly);
          }
        });
      });
    }
  }, [policyIngressContract, setPolicyList, setPolicyReadOnly]);

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
export const usePolicyData = () => {
  const context = useContext(PolicyDataContext);

  if (!context) {
    throw new Error('usePolicyData must be used within an PolicyDataProvider.');
  }

  const { policyList, setPolicyList, policyReadOnly, setPolicyReadOnly, policyRulesContract } = context;
  //console.log("LIST: ", policyList);
  useEffect(() => {
    loadPolicyData(policyRulesContract, setPolicyList, setPolicyReadOnly);
  }, [policyRulesContract, setPolicyList, setPolicyReadOnly]);

  const formattedPolicyList = useMemo(() => {
    return policyList
      .map(policy => ({
        ...policy,
        identifier: policy.policyId.toString(),
        //hash: policy.hashedInfo,
        //enrolled: policy.enrolled,
        status: 'active'
      }))
      .reverse();
  }, [policyList]);
  //console.log("LIST1: ", formattedPolicyList);

  const dataReady = useMemo(() => {
    return policyRulesContract !== undefined && policyReadOnly !== undefined && policyList !== undefined;
  }, [policyRulesContract, policyReadOnly, policyList]);

  return {
    dataReady,
    allowlist: formattedPolicyList,
    isReadOnly: policyReadOnly,
    policyRulesContract
  };
};
