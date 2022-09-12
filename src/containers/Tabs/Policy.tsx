// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { isAddress } from 'web3-utils';
import idx from 'idx';
// Context
import { useAccountData } from '../../context/policyData';
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

type Account = {
  policyId: BigNumber;
  identifier: string;
  policyRoles?: BigNumber[];
  policyService?: BigNumber;
  policyProvider?: string;
  hashedInfo?: string;
  status: string;
};

const PolicyTabContainer: React.FC<PolicyTabContainerProps> = ({ isOpen }) => {
  const { isAdmin, dataReady: adminDataReady } = useAdminData();
  const { allowlist, isReadOnly, dataReady, accountRulesContract } = useAccountData();

  const { list, modals, toggleModal, addTransaction, updateTransaction, deleteTransaction, openToast } = useTab(
    allowlist,
    (identifier: string) => ({ policyId: new BigNumber(identifier) })
  );
  // console.log("LIST!: ",allowlist);
  console.log('LIST#: ', list);
  if (!!accountRulesContract) {
    const handleAdd = async (value: string) => {
      try {
        const tx = await accountRulesContract!.functions.addPolicy([1, 2], 1, value, '');
        toggleModal('add')(false);
        addTransaction(value, PENDING_ADDITION);
        const receipt = await tx.wait(1); // wait on receipt confirmations
        const addEvent = receipt.events!.filter(e => e.event && e.event === 'AccountAdded').pop();
        if (!addEvent) {
          openToast(value, FAIL, `Error while processing account: ${value}`);
        } else {
          const addSuccessResult = idx(addEvent, _ => _.args[0]);
          if (addSuccessResult === undefined) {
            openToast(value, FAIL, `Error while adding account: ${value}`);
          } else if (Boolean(addSuccessResult)) {
            openToast(value, SUCCESS, `New account added: ${value}`);
          } else {
            openToast(value, FAIL, `Account "${value}" is already added`);
          }
        }
        deleteTransaction(value);
      } catch (e) {
        toggleModal('add')(false);
        updateTransaction(value, FAIL_ADDITION);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not add account', `${value} was unable to be added. Please try again.`)
        );
      }
    };

    const handleRemove = async (value: string) => {
      try {
        const est = await accountRulesContract!.estimate.removePolicy(value);
        const tx = await accountRulesContract!.functions.removePolicy(value, { gasLimit: est.toNumber() * 2 });
        toggleModal('remove')(false);
        addTransaction(value, PENDING_REMOVAL);
        await tx.wait(1); // wait on receipt confirmations
        openToast(value, SUCCESS, `Removal of account processed: ${value}`);
        deleteZitiIdentity(value);
        deleteTransaction(value);
      } catch (e) {
        console.log('error', e);
        toggleModal('remove')(false);
        updateTransaction(value, FAIL_REMOVAL);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not remove account', `${value} was unable to be removed. Please try again.`)
        );
      }
    };

    const isValidAccount = (address: string) => {
      let isValidAddress = isAddress(address);
      if (!isValidAddress) {
        return {
          valid: false
        };
      }

      let isDuplicateAccount =
        list.filter((item: Account) => address.toLowerCase() === item.identifier.toLowerCase()).length > 0;
      if (isDuplicateAccount) {
        return {
          valid: false,
          msg: 'Account address is already added.'
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
          isValid={isValidAccount}
          isOpen={isOpen}
          isReadOnly={isReadOnly!}
        />
      );
    } else if (isOpen && !allDataReady) {
      return <LoadingPage />;
    } else {
      return <div />;
    }
  } else if (isOpen && !accountRulesContract) {
    return <NoContract tabName="Account Rules" />;
  } else {
    return <div />;
  }
};

PolicyTabContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default PolicyTabContainer;
