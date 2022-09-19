// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { isAddress } from 'web3-utils';
import idx from 'idx';
// Context
import { usePolicyData } from '../../context/policyData';
import { useAdminData } from '../../context/adminData';
// Utils
import useTab from './useTabPolicy';
import { errorToast } from '../../util/tabTools';
import { deleteZitiIdentity } from '../../util/api';

// Components
import PolicyTab from '../../components/PolicyTab/PolicyTab';
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

import { BigNumber } from 'ethers/utils';

type PolicyTabContainerProps = {
  isOpen: boolean;
};

type Policy = {
  policyId: string;
  identifier: string;
  policyRoles?: string;
  policyService?: string;
  policyProvider?: string;
  hashedInfo?: string;
  status: string;
};

const PolicyTabContainer: React.FC<PolicyTabContainerProps> = ({ isOpen }) => {
  const { isAdmin, dataReady: adminDataReady } = useAdminData();
  const { allowlist, isReadOnly, dataReady, policyRulesContract } = usePolicyData();

  const { list, modals, toggleModal, addTransaction, updateTransaction, deleteTransaction, openToast } = useTab(
    allowlist,
    (identifier: string) => ({ policyId: identifier })
  );
  // console.log("LIST!: ",allowlist);
  console.log('LIST#: ', list);
  if (!!policyRulesContract) {
    const handleAdd = async (value: string[], value2: string, value3: string) => {
      try {
        const tx = await policyRulesContract!.functions.addPolicy(value, value2, value3, '');
        toggleModal('add')(false);
        addTransaction(value2, PENDING_ADDITION);
        const receipt = await tx.wait(1); // wait on receipt confirmations
        const addEvent = receipt.events!.filter(e => e.event && e.event === 'PolicyAdded').pop();
        if (!addEvent) {
          openToast(value2, FAIL, `Error while processing policy: ${value}`);
        } else {
          const addSuccessResult = idx(addEvent, _ => _.args[0]);
          if (addSuccessResult === undefined) {
            openToast(value2, FAIL, `Error while adding policy: ${value2}`);
          } else if (Boolean(addSuccessResult)) {
            openToast(value2, SUCCESS, `New policy added: ${value2}`);
          } else {
            openToast(value2, FAIL, `Policy "${value2}" is already added`);
          }
        }
        deleteTransaction(value2);
      } catch (e) {
        toggleModal('add')(false);
        updateTransaction(value2, FAIL_ADDITION);
        errorToast(e, value2, openToast, () =>
          openToast(value2, FAIL, 'Could not add policy', `${value2} was unable to be added. Please try again.`)
        );
      }
    };

    const handleRemove = async (value: string) => {
      try {
        const est = await policyRulesContract!.estimate.removePolicy(value);
        const tx = await policyRulesContract!.functions.removePolicy(value, { gasLimit: est.toNumber() * 2 });
        toggleModal('remove')(false);
        addTransaction(value, PENDING_REMOVAL);
        await tx.wait(1); // wait on receipt confirmations
        openToast(value, SUCCESS, `Removal of policy processed: ${value}`);
        //deleteZitiIdentity(value);
        deleteTransaction(value);
      } catch (e) {
        console.log('error', e);
        toggleModal('remove')(false);
        updateTransaction(value, FAIL_REMOVAL);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not remove policy', `${value} was unable to be removed. Please try again.`)
        );
      }
    };

    //Validate the Policy Name
    const isValidPolicy = (name: string) => {
      let isValidPolicy = true;
      if (!isValidPolicy) {
        return {
          valid: false
        };
      }

      let isDuplicatePolicy =
        list.filter((item: Policy) => name.toLowerCase() === item.policyId?.toLowerCase()).length > 0;
      if (isDuplicatePolicy) {
        return {
          valid: false,
          msg: 'Policy is already added.'
        };
      }

      return {
        valid: true
      };
    }; //Validate the Policy Type
    const isValidPolicy2 = (address: string) => {
      let isValidPolicy = true;
      if (!isValidPolicy) {
        return {
          valid: false
        };
      }

      /*       let isDuplicatePolicy =
        list.filter((item: Policy) => address.toString() === item.identifier.toLowerCase()).length > 0;
      if (isDuplicatePolicy) {
        return {
          valid: false,
          msg: 'Policy address is already added.'
        };
      } */

      return {
        valid: true
      };
    };

    //Validate the Policy attributes
    const isValidPolicy3 = (attribute: string[]) => {
      let isValidPolicy = true;
      if (!isValidPolicy) {
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
        <PolicyTab
          list={list}
          modals={modals}
          toggleModal={toggleModal}
          handleAdd={handleAdd}
          handleRemove={handleRemove}
          isAdmin={isAdmin}
          deleteTransaction={deleteTransaction}
          isValidString={isValidPolicy}
          isValidArray={isValidPolicy3}
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
    return <NoContract tabName="Policy Rules" />;
  } else {
    return <div />;
  }
};

PolicyTabContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default PolicyTabContainer;
