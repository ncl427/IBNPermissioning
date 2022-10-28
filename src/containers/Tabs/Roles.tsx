// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { isAddress } from 'web3-utils';
import idx from 'idx';
// Context
import { useRoleData } from '../../context/rolesData';
import { useAdminData } from '../../context/adminData';
// Utils
import useTab from './useTabRole';
import { errorToast } from '../../util/tabTools';
import { deleteZitiIdentity } from '../../util/api';

// Components
import RolesTab from '../../components/RolesTab/RolesTab';
import LoadingPage from '../../components/LoadingPage/LoadingPage';
import NoContract from '../../components/Flashes/NoContract';
// Constants
import {
  PENDING_ADDITION,
  FAIL_ADDITION,
  PENDING_REMOVAL,
  FAIL_REMOVAL,
  SUCCESS,
  FAIL
} from '../../constants/transactions';
//import { BigNumber } from 'ethers/utils';

type RoleTabContainerProps = {
  isOpen: boolean;
};

type Role = {
  roleId: string;
  identifier: string;
  roleName?: string;
  roleType?: string;
  roleAttributes?: string[];
  status: string;
};

const RoleTabContainer: React.FC<RoleTabContainerProps> = ({ isOpen }) => {
  const { isAdmin, dataReady: adminDataReady } = useAdminData();
  const { rolelist, isReadOnly, dataReady, policyRulesContract, roleTypes } = useRoleData();

  const { list, modals, toggleModal, addTransaction, updateTransaction, deleteTransaction, openToast } = useTab(
    rolelist,
    (identifier: string) => ({ roleId: identifier })
  );
  // console.log("LIST!: ",rolelist);
  console.log('LIST#: ', list);
  if (!!policyRulesContract) {
    const handleAdd = async (value: string, value2: string /* , value3: string[] */) => {
      try {
        let newList: string[] = [];
        let typeAtt: string = '';
        const myType = roleTypes.find(({ roleTypeId }) => roleTypeId == value2);
        console.log('ROLE TYPES', myType);
        typeAtt = myType?.roleTypeAttributes || '';
        newList.push(typeAtt);
        const tx = await policyRulesContract!.functions.addRole(value, value2, newList);
        toggleModal('add')(false);
        addTransaction(value, PENDING_ADDITION);
        const receipt = await tx.wait(1); // wait on receipt confirmations
        const addEvent = receipt.events!.filter(e => e.event && e.event === 'RoleAdded').pop();
        if (!addEvent) {
          openToast(value, FAIL, `Error while processing role: ${value}`);
        } else {
          const addSuccessResult = idx(addEvent, _ => _.args[0]);
          if (addSuccessResult === undefined) {
            openToast(value, FAIL, `Error while adding role: ${value}`);
          } else if (Boolean(addSuccessResult)) {
            openToast(value, SUCCESS, `New role added: ${value}`);
          } else {
            openToast(value, FAIL, `Role "${value}" is already added`);
          }
        }
        deleteTransaction(value);
      } catch (e) {
        toggleModal('add')(false);
        updateTransaction(value, FAIL_ADDITION);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not add role', `${value} was unable to be added. Please try again.`)
        );
      }
    };

    const handleRemove = async (value: string) => {
      try {
        const est = await policyRulesContract!.estimate.removeRole(value);
        const tx = await policyRulesContract!.functions.removeRole(value, { gasLimit: est.toNumber() * 2 });
        toggleModal('remove')(false);
        addTransaction(value, PENDING_REMOVAL);
        await tx.wait(1); // wait on receipt confirmations
        openToast(value, SUCCESS, `Removal of role processed: ${value}`);
        //deleteZitiIdentity(value);
        deleteTransaction(value);
      } catch (e) {
        console.log('error', e);
        toggleModal('remove')(false);
        updateTransaction(value, FAIL_REMOVAL);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not remove role', `${value} was unable to be removed. Please try again.`)
        );
      }
    };

    //Validate the Role Name
    const isValidRole = (name: string) => {
      let isValidRole = true;
      if (!isValidRole) {
        return {
          valid: false
        };
      }

      let isDuplicateRole = list.filter((item: Role) => name.toLowerCase() === item.roleName?.toLowerCase()).length > 0;
      if (isDuplicateRole) {
        return {
          valid: false,
          msg: 'Role is already added.'
        };
      }

      return {
        valid: true
      };
    }; //Validate the Role Type
    const isValidRole2 = (address: string) => {
      let isValidRole = true;
      if (!isValidRole) {
        return {
          valid: false
        };
      }

      /*       let isDuplicateRole =
        list.filter((item: Role) => address.toString() === item.identifier.toLowerCase()).length > 0;
      if (isDuplicateRole) {
        return {
          valid: false,
          msg: 'Role address is already added.'
        };
      } */

      return {
        valid: true
      };
    };

    //Validate the Role attributes
    const isValidRole3 = (attribute: string[]) => {
      let isValidRole = true;
      if (!isValidRole) {
        return {
          valid: false
        };
      }

      return {
        valid: true
      };
    };

    const allDataReady: boolean = dataReady && adminDataReady;
    if (isOpen && allDataReady) {
      return (
        <RolesTab
          list={list}
          modals={modals}
          toggleModal={toggleModal}
          handleAdd={handleAdd}
          handleRemove={handleRemove}
          isAdmin={isAdmin}
          deleteTransaction={deleteTransaction}
          isValidString={isValidRole}
          isValidArray={isValidRole3}
          isOpen={isOpen}
          isReadOnly={isReadOnly!}
        />
      );
    } else if (isOpen && !allDataReady) {
      return <LoadingPage />;
    } else {
      return <div />;
    }
  } else if (isOpen && !policyRulesContract) {
    return <NoContract tabName="Role Rules" />;
  } else {
    return <div />;
  }
};

RoleTabContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default RoleTabContainer;
