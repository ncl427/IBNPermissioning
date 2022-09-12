import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PolicyRules } from '../chain/@types/PolicyRules';
import { policyRulesFactory } from '../chain/contracts/PolicyRules';
import { useNetwork } from './network';
import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';

//import BigNumber from 'bignumber.js'

type Account = {
  policyId: BigNumber;
  policyRoles: BigNumber[];
  policyService: BigNumber;
  policyProvider: string;
  hashedInfo: string;
};
//type Identity = { hashedInfo: string, enrolled: boolean };

type ContextType =
  | {
      accountList: Account[];
      setAccountList: React.Dispatch<React.SetStateAction<Account[]>>;
      //hashList: Identity[];
      //setHashList: React.Dispatch<React.SetStateAction<Identity[]>>;
      accountReadOnly?: boolean;
      setAccountReadOnly: React.Dispatch<React.SetStateAction<boolean | undefined>>;
      accountRulesContract?: PolicyRules;
      setAccountRulesContract: React.Dispatch<React.SetStateAction<PolicyRules | undefined>>;
    }
  | undefined;

const AccountDataContext = createContext<ContextType>(undefined);

// //LOADS the HAshed policy and enrolled status from the Blockchain

const loadAccountData = (
  accountRulesContract: PolicyRules | undefined,
  setAccountList: (account: Account[]) => void,
  setAccountReadOnly: (readOnly?: boolean) => void
) => {
  if (accountRulesContract === undefined) {
    setAccountList([]);
    setAccountReadOnly(undefined);
  } else {
    accountRulesContract.functions.isReadOnly().then(isReadOnly => setAccountReadOnly(isReadOnly));
    console.log('PEEENIIICHI:', accountRulesContract);

    accountRulesContract.functions.policiesSize().then(listSize => {
      const listElementsPromises: Promise<BigNumber>[] = [];
      let listHashPromises: Promise<any>[] = [];
      for (let i = 0; listSize.gt(i); i++) {
        listElementsPromises.push(accountRulesContract.functions.getPolicyByIndex(i));
      }
      Promise.all(listElementsPromises).then(responses1 => {
        listHashPromises = responses1.map(policyId => accountRulesContract.functions.getFullPolicyById(policyId));
        //setAccountList(responses1.map(address => ({ address })));
        console.log('HASHEDInfo: ', listHashPromises);

        Promise.all(listHashPromises).then(responses2 => {
          // const zip = (a1: any[],a2: { [x: string]: any; }) => a1.map((x, i) => [x,a2[i]]);
          // const listIdentities = zip(responses1, responses2)
          //console.log("HASHEDInfo: ", listIdentities );
          setAccountList(
            responses2.map((identity, i) => {
              const idobject: Account = {
                policyId: new BigNumber(0),
                policyRoles: [new BigNumber(0)],
                policyService: new BigNumber(0),
                policyProvider: '',
                hashedInfo: ''
              };
              idobject.policyId = responses1[i];
              idobject.policyRoles = identity.policyRoles;
              idobject.policyService = identity.policyService;
              idobject.policyProvider = identity.policyProvider;
              idobject.hashedInfo = identity.hashedInfo;
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
//    accountRulesContract: PolicyRules | undefined,
//    setHashList: (account: Identity[]) => void) => {
//    if (accountRulesContract === undefined) {
//      setHashList([]);
//    } else {
//      accountRulesContract.functions.getSize().then(listSize => {
//        const listElementsPromises : Promise<string>[] = [];
//        let listHashPromises : Promise<any>[] = [];
//        for (let i = 0; listSize.gt(i); i++) {
//          listElementsPromises.push(accountRulesContract.functions.getByIndex(i));
//        }
//        Promise.all(listElementsPromises).then(responses => {
//          console.log("Info: ", listElementsPromises );
//          listHashPromises = responses.map(address =>  accountRulesContract.functions.getFullByAddress(address) );
//          Promise.all(listHashPromises).then(responses => {
//           console.log("HASHEDInfo: ", listHashPromises );
//           setHashList(responses.map(identity => {
//              const idobject: Identity = {hashedInfo: '', enrolled: false};
//              idobject.enrolled = identity.enrolled;
//              idobject.hashedInfo = identity.hashedInfo;
//             return idobject;
//           } ));
//         });
//        });

//      });
//    }
//  };

/**
 * Provider for the data context that contains the account list
 * @param {Object} props Props given to the PolicyDataProvider
 * @return The provider with the following value:
 *  - accountList: list of permitted accounts from Account Rules contract
 *  - setAccountList: setter for the allowlist state
 */
export const PolicyDataProvider: React.FC<{}> = props => {
  const [accountList, setAccountList] = useState<Account[]>([]);
  //const [hashList, setHashList] = useState<Identity[]>([]);
  const [accountReadOnly, setAccountReadOnly] = useState<boolean | undefined>(undefined);
  const [accountRulesContract, setAccountRulesContract] = useState<PolicyRules | undefined>(undefined);

  const value = useMemo(
    () => ({
      accountList: accountList,
      setAccountList: setAccountList,
      accountReadOnly,
      setAccountReadOnly,
      accountRulesContract,
      setAccountRulesContract
    }),
    [accountList, setAccountList, accountReadOnly, setAccountReadOnly, accountRulesContract, setAccountRulesContract]
  );

  const { accountIngressContract } = useNetwork();

  useEffect(() => {
    if (accountIngressContract === undefined) {
      setAccountRulesContract(undefined);
    } else {
      policyRulesFactory(accountIngressContract).then(contract => {
        setAccountRulesContract(contract);
        contract.removeAllListeners('PolicyAdded');
        contract.removeAllListeners('PolicyRemoved');
        contract.removeAllListeners('PolicyUpdated');
        contract.on('PolicyAdded', (success, account, event) => {
          if (success) {
            loadAccountData(contract, setAccountList, setAccountReadOnly);
            //console.log("LIST: ", accountList);
          }
        });
        contract.on('PolicyUpdated', (success, account, event) => {
          if (success) {
            loadAccountData(contract, setAccountList, setAccountReadOnly);
            //console.log("LIST: ", accountList);
          }
        });
        contract.on('PolicyRemoved', (success, account, event) => {
          if (success) {
            loadAccountData(contract, setAccountList, setAccountReadOnly);
          }
        });
      });
    }
  }, [accountIngressContract, setAccountList, setAccountReadOnly]);

  return <AccountDataContext.Provider value={value} {...props} />;
};

/**
 * Fetch the appropriate account data on chain and synchronize with it
 * @return {Object} Contains data of interest:
 *  - dataReady: true if isReadOnly and account allowlist are correctly fetched,
 *  false otherwise
 *  - userAddress: Address of the user
 *  - isReadOnly: Account contract is lock or unlock,
 *  - allowlist: list of permitted accounts from Account contract,
 */
export const useAccountData = () => {
  const context = useContext(AccountDataContext);

  if (!context) {
    throw new Error('useAccountData must be used within an PolicyDataProvider.');
  }

  const { accountList, setAccountList, accountReadOnly, setAccountReadOnly, accountRulesContract } = context;
  //console.log("LIST: ", accountList);
  useEffect(() => {
    loadAccountData(accountRulesContract, setAccountList, setAccountReadOnly);
  }, [accountRulesContract, setAccountList, setAccountReadOnly]);

  const formattedAccountList = useMemo(() => {
    return accountList
      .map(account => ({
        ...account,
        identifier: account.policyId.toString(),
        //hash: account.hashedInfo,
        //enrolled: account.enrolled,
        status: 'active'
      }))
      .reverse();
  }, [accountList]);
  //console.log("LIST1: ", formattedAccountList);

  const dataReady = useMemo(() => {
    return accountRulesContract !== undefined && accountReadOnly !== undefined && accountList !== undefined;
  }, [accountRulesContract, accountReadOnly, accountList]);

  return {
    dataReady,
    allowlist: formattedAccountList,
    isReadOnly: accountReadOnly,
    accountRulesContract
  };
};
