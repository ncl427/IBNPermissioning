import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PolicyRules } from '../chain/@types/PolicyRules';
import { policyRulesFactory } from '../chain/contracts/PolicyRules';
import { useNetwork } from './network';
import { BigNumber } from 'ethers/utils';

//import BigNumber from 'bignumber.js'

type Role = {
  roleId: string;
  roleName: string;
  //roleType: string;
  roleAttributes: string[];
};

type RoleType = {
  roleTypeId: string;
  roleTypeName: string;
  roleTypeAttributes: string;
};

//type Role = { hashedInfo: string, enrolled: boolean };

type ContextType =
  | {
      roleList: Role[];
      setRoleList: React.Dispatch<React.SetStateAction<Role[]>>;
      roleTypes: RoleType[];
      setRoleTypes: React.Dispatch<React.SetStateAction<RoleType[]>>;
      roleTypeList: string[];
      setRoleTypeList: React.Dispatch<React.SetStateAction<string[]>>;
      roleReadOnly?: boolean;
      setRoleReadOnly: React.Dispatch<React.SetStateAction<boolean | undefined>>;
      policyRulesContract?: PolicyRules;
      setPolicyRulesContract: React.Dispatch<React.SetStateAction<PolicyRules | undefined>>;
    }
  | undefined;

const RoleDataContext = createContext<ContextType>(undefined);

// //LOADS the HAshed role and enrolled status from the Blockchain

const loadRoleData = (
  policyRulesContract: PolicyRules | undefined,
  setRoleList: (role: Role[]) => void,
  setRoleTypes: (role: RoleType[]) => void,
  setRoleTypeList: (type: string[]) => void,
  setRoleReadOnly: (readOnly?: boolean) => void
) => {
  if (policyRulesContract === undefined) {
    setRoleList([]);
    setRoleTypeList([]);
    setRoleTypes([]);
    setRoleReadOnly(undefined);
  } else {
    policyRulesContract.functions.isReadOnly().then(isReadOnly => setRoleReadOnly(isReadOnly));
    policyRulesContract.functions.rolesSize().then(listSize => {
      const listElementsPromises: Promise<BigNumber>[] = [];
      let listHashPromises: Promise<any>[] = [];
      let listHashPromise2: Promise<any>[] = [];

      for (let i = 0; listSize.gt(i); i++) {
        listElementsPromises.push(policyRulesContract.functions.getRoleByIndex(i));
      }
      Promise.all(listElementsPromises).then(responses1 => {
        listHashPromises = responses1.map(roleId => policyRulesContract.functions.getFullRoleById(roleId));
        //setRoleList(responses1.map(address => ({ address })));
        console.log('HASHEDInfoPol: ', listHashPromises);

        Promise.all(listHashPromises).then(responses2 => {
          setRoleList(
            responses2.map((role, i) => {
              const idobject: Role = {
                roleId: '',
                roleName: '',
                roleAttributes: ['']
              };

              idobject.roleId = responses1[i].toString();
              idobject.roleName = role.roleName;
              idobject.roleAttributes = role.roleAttributes;

              console.log('ROLE', idobject);

              return idobject;
            })
          );

          //For getting the Role Types per each role
          Promise.all(
            responses2.map(type => {
              var result: Promise<string> = policyRulesContract.functions
                .getFullRoleTypeById(type.roleType)
                .then(result => {
                  return result.roleTypeName;
                });
              return result;
            })
          ).then(response3 => {
            setRoleTypeList(response3);
          });
        });
      });
    });

    policyRulesContract.functions.roleTypesSize().then(listSize => {
      const listElementsPromises: Promise<BigNumber>[] = [];
      let listHashPromises: Promise<any>[] = [];
      let listHashPromise2: Promise<any>[] = [];

      for (let i = 0; listSize.gt(i); i++) {
        listElementsPromises.push(policyRulesContract.functions.getRoleTypeByIndex(i));
      }
      Promise.all(listElementsPromises).then(responses1 => {
        listHashPromises = responses1.map(roleTypeId => policyRulesContract.functions.getFullRoleTypeById(roleTypeId));
        //setRoleList(responses1.map(address => ({ address })));
        console.log('HASHEDInfoPol2: ', listHashPromises);

        Promise.all(listHashPromises).then(responses2 => {
          setRoleTypes(
            responses2.map((role, i) => {
              const idobject: RoleType = {
                roleTypeId: '',
                roleTypeName: '',
                roleTypeAttributes: ''
              };

              idobject.roleTypeId = responses1[i].toString();
              idobject.roleTypeName = role.roleTypeName;
              idobject.roleTypeAttributes = role.roleTypeAttributes;

              console.log('ROLETYPE', idobject);

              return idobject;
            })
          );
        });
      });
    });
  }
};

/**
 * Provider for the data context that contains the role list
 * @param {Object} props Props given to the RolesDataProvider
 * @return The provider with the following value:
 *  - roleList: list of permitted roles from Role Rules contract
 *  - setRoleList: setter for the allowlist state
 */
export const RolesDataProvider: React.FC<{}> = props => {
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [roleTypeList, setRoleTypeList] = useState<string[]>([]);
  const [roleReadOnly, setRoleReadOnly] = useState<boolean | undefined>(undefined);
  const [policyRulesContract, setPolicyRulesContract] = useState<PolicyRules | undefined>(undefined);

  const value = useMemo(
    () => ({
      roleList: roleList,
      setRoleList: setRoleList,
      roleTypes: roleTypes,
      setRoleTypes: setRoleTypes,
      roleTypeList: roleTypeList,
      setRoleTypeList: setRoleTypeList,
      roleReadOnly,
      setRoleReadOnly,
      policyRulesContract,
      setPolicyRulesContract
    }),
    [
      roleList,
      setRoleList,
      roleTypes,
      setRoleTypes,
      roleTypeList,
      setRoleTypeList,
      roleReadOnly,
      setRoleReadOnly,
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
        contract.removeAllListeners('RoleAdded');
        contract.removeAllListeners('RoleRemoved');
        contract.removeAllListeners('RoleUpdated');
        contract.on('RoleAdded', (success, role, event) => {
          if (success) {
            loadRoleData(contract, setRoleList, setRoleTypes, setRoleTypeList, setRoleReadOnly);
            //console.log("LIST: ", roleList);
          }
        });
        contract.on('RoleUpdated', (success, role, event) => {
          if (success) {
            loadRoleData(contract, setRoleList, setRoleTypes, setRoleTypeList, setRoleReadOnly);
            //console.log("LIST: ", roleList);
          }
        });
        contract.on('RoleRemoved', (success, role, event) => {
          if (success) {
            loadRoleData(contract, setRoleList, setRoleTypes, setRoleTypeList, setRoleReadOnly);
          }
        });
      });
    }
  }, [policyIngressContract, setRoleList, setRoleTypes, setRoleTypeList, setRoleReadOnly]);

  return <RoleDataContext.Provider value={value} {...props} />;
};

/**
 * Fetch the appropriate role data on chain and synchronize with it
 * @return {Object} Contains data of interest:
 *  - dataReady: true if isReadOnly and role allowlist are correctly fetched,
 *  false otherwise
 *  - userAddress: Address of the user
 *  - isReadOnly: Role contract is lock or unlock,
 *  - allowlist: list of permitted roles from Role contract,
 */
export const useRoleData = () => {
  const context = useContext(RoleDataContext);

  if (!context) {
    throw new Error('useRoleData must be used within an RolesDataProvider.');
  }

  const {
    roleList,
    setRoleList,
    roleReadOnly,
    setRoleReadOnly,
    roleTypeList,
    setRoleTypeList,
    policyRulesContract,
    roleTypes,
    setRoleTypes
  } = context;
  //console.log("LIST: ", roleList);
  useEffect(() => {
    loadRoleData(policyRulesContract, setRoleList, setRoleTypes, setRoleTypeList, setRoleReadOnly);
  }, [policyRulesContract, setRoleList, setRoleTypes, setRoleTypeList, setRoleReadOnly]);

  const formattedRoleList = useMemo(() => {
    return roleList
      .map((role, i) => ({
        ...role,
        identifier: role.roleId.toString(),
        roleType: roleTypeList[i],
        //hash: role.hashedInfo,
        //enrolled: role.enrolled,
        status: 'active'
      }))
      .reverse();
  }, [roleList, roleTypeList]);
  console.log('ROLELIST1---------------: ', formattedRoleList);

  const formattedRoleTypeList = useMemo(() => {
    return roleTypes
      .map((role, i) => ({
        ...role,
        identifier: role.roleTypeId.toString()
      }))
      .reverse();
  }, [roleTypes]);
  console.log('ROLELTYPES1---------------: ', roleTypes);

  const dataReady = useMemo(() => {
    return policyRulesContract !== undefined && roleReadOnly !== undefined && roleList !== undefined;
  }, [policyRulesContract, roleReadOnly, roleList, roleTypeList]);

  return {
    dataReady,
    allowlist: formattedRoleList,
    roleTypes: roleTypes,
    isReadOnly: roleReadOnly,
    policyRulesContract
  };
};
