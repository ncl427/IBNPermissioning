// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { isAddress } from 'web3-utils';
import idx from 'idx';
// Context
import { useServiceData } from '../../context/serviceData';
import { useAdminData } from '../../context/adminData';
// Utils
import useTab from './useTabService';
import { errorToast } from '../../util/tabTools';
import { deleteZitiIdentity } from '../../util/api';

// Components
import ServicesTab from '../../components/ServiceTab/ServiceTab';
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

type ServiceTabContainerProps = {
  isOpen: boolean;
};

type Service = {
  serviceId: string;
  identifier: string;
  serviceName?: string;
  serviceDescription?: string;
  serviceConfig?: string[];
  status: string;
};

const ServiceTabContainer: React.FC<ServiceTabContainerProps> = ({ isOpen }) => {
  const { isAdmin, dataReady: adminDataReady } = useAdminData();
  const { allowlist, isReadOnly, dataReady, policyRulesContract } = useServiceData();

  const { list, modals, toggleModal, addTransaction, updateTransaction, deleteTransaction, openToast } = useTab(
    allowlist,
    (identifier: string) => ({ serviceId: identifier })
  );
  // console.log("LIST!: ",allowlist);
  console.log('LIST#: ', list);
  if (!!policyRulesContract) {
    const handleAdd = async (value: string, value2: string, value3: string[]) => {
      try {
        const tx = await policyRulesContract!.functions.addService(value, value2, value3);
        toggleModal('add')(false);
        addTransaction(value, PENDING_ADDITION);
        const receipt = await tx.wait(1); // wait on receipt confirmations
        const addEvent = receipt.events!.filter(e => e.event && e.event === 'ServiceAdded').pop();
        console.log('MY ADD EVENT', addEvent);
        if (!addEvent) {
          openToast(value, FAIL, `Error while processing service: ${value}`);
        } else {
          const addSuccessResult = idx(addEvent, _ => _.args[0]);
          if (addSuccessResult === undefined) {
            openToast(value, FAIL, `Error while adding service: ${value}`);
          } else if (Boolean(addSuccessResult)) {
            openToast(value, SUCCESS, `New service added: ${value}`);
          } else {
            openToast(value, FAIL, `Service "${value}" is already added`);
          }
        }
        deleteTransaction(value);
      } catch (e) {
        toggleModal('add')(false);
        updateTransaction(value, FAIL_ADDITION);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not add service', `${value} was unable to be added. Please try again.`)
        );
      }
    };

    const handleRemove = async (value: string) => {
      try {
        const est = await policyRulesContract!.estimate.removeService(value);
        const tx = await policyRulesContract!.functions.removeService(value, { gasLimit: est.toNumber() * 2 });
        toggleModal('remove')(false);
        addTransaction(value, PENDING_REMOVAL);
        await tx.wait(1); // wait on receipt confirmations
        openToast(value, SUCCESS, `Removal of service processed: ${value}`);
        //deleteZitiIdentity(value);
        deleteTransaction(value);
      } catch (e) {
        console.log('error', e);
        toggleModal('remove')(false);
        updateTransaction(value, FAIL_REMOVAL);
        errorToast(e, value, openToast, () =>
          openToast(value, FAIL, 'Could not remove service', `${value} was unable to be removed. Please try again.`)
        );
      }
    };

    //Validate the Service Name
    const isValidService = (name: string) => {
      let isValidService = true;
      if (!isValidService) {
        return {
          valid: false
        };
      }

      let isDuplicateService =
        list.filter((item: Service) => name.toLowerCase() === item.serviceName?.toLowerCase()).length > 0;
      if (isDuplicateService) {
        return {
          valid: false,
          msg: 'Service is already added.'
        };
      }

      return {
        valid: true
      };
    }; //Validate the Service Type
    const isValidService2 = (address: string) => {
      let isValidService = true;
      if (!isValidService) {
        return {
          valid: false
        };
      }

      /*       let isDuplicateService =
        list.filter((item: Service) => address.toString() === item.identifier.toLowerCase()).length > 0;
      if (isDuplicateService) {
        return {
          valid: false,
          msg: 'Service address is already added.'
        };
      } */

      return {
        valid: true
      };
    };

    //Validate the Service attributes
    const isValidService3 = (attribute: string[]) => {
      let isValidService = true;
      if (!isValidService) {
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
        <ServicesTab
          list={list}
          modals={modals}
          toggleModal={toggleModal}
          handleAdd={handleAdd}
          handleRemove={handleRemove}
          isAdmin={isAdmin}
          deleteTransaction={deleteTransaction}
          isValidString={isValidService}
          isValidArray={isValidService3}
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
    return <NoContract tabName="Service Rules" />;
  } else {
    return <div />;
  }
};

ServiceTabContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default ServiceTabContainer;
