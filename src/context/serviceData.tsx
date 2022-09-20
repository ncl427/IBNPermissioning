import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PolicyRules } from '../chain/@types/PolicyRules';
import { policyRulesFactory } from '../chain/contracts/PolicyRules';
import { useNetwork } from './network';
import { BigNumber } from 'ethers/utils';

//import BigNumber from 'bignumber.js'

type Service = {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  serviceConfig: string[];
};

//type Service = { hashedInfo: string, enrolled: boolean };

type ContextType =
  | {
      serviceList: Service[];
      setServiceList: React.Dispatch<React.SetStateAction<Service[]>>;
      serviceReadOnly?: boolean;
      setServiceReadOnly: React.Dispatch<React.SetStateAction<boolean | undefined>>;
      policyRulesContract?: PolicyRules;
      setPolicyRulesContract: React.Dispatch<React.SetStateAction<PolicyRules | undefined>>;
    }
  | undefined;

const ServiceDataContext = createContext<ContextType>(undefined);

// //LOADS the HAshed service and enrolled status from the Blockchain

const loadServiceData = (
  policyRulesContract: PolicyRules | undefined,
  setServiceList: (service: Service[]) => void,
  setServiceReadOnly: (readOnly?: boolean) => void
) => {
  if (policyRulesContract === undefined) {
    setServiceList([]);
    setServiceReadOnly(undefined);
  } else {
    policyRulesContract.functions.isReadOnly().then(isReadOnly => setServiceReadOnly(isReadOnly));
    policyRulesContract.functions.servicesSize().then(listSize => {
      const listElementsPromises: Promise<BigNumber>[] = [];
      let listHashPromises: Promise<any>[] = [];
      let listHashPromise2: Promise<any>[] = [];

      for (let i = 0; listSize.gt(i); i++) {
        listElementsPromises.push(policyRulesContract.functions.getServiceByIndex(i));
      }
      Promise.all(listElementsPromises).then(responses1 => {
        listHashPromises = responses1.map(serviceId => policyRulesContract.functions.getFullServiceById(serviceId));
        //setServiceList(responses1.map(address => ({ address })));
        console.log('HASHEDInfoPol: ', listHashPromises);

        Promise.all(listHashPromises).then(responses2 => {
          setServiceList(
            responses2.map((service, i) => {
              const idobject: Service = {
                serviceId: '',
                serviceName: '',
                serviceDescription: '',
                serviceConfig: ['']
              };

              idobject.serviceId = responses1[i].toString();
              idobject.serviceName = service.serviceName;
              idobject.serviceConfig = service.serviceConfig;
              idobject.serviceDescription = service.description;

              console.log('SERVICE', idobject);

              return idobject;
            })
          );
        });
      });
    });
  }
};

/**
 * Provider for the data context that contains the service list
 * @param {Object} props Props given to the ServicesDataProvider
 * @return The provider with the following value:
 *  - serviceList: list of permitted services from Service Rules contract
 *  - setServiceList: setter for the allowlist state
 */
export const ServicesDataProvider: React.FC<{}> = props => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [serviceReadOnly, setServiceReadOnly] = useState<boolean | undefined>(undefined);
  const [policyRulesContract, setPolicyRulesContract] = useState<PolicyRules | undefined>(undefined);

  const value = useMemo(
    () => ({
      serviceList: serviceList,
      setServiceList: setServiceList,
      serviceReadOnly,
      setServiceReadOnly,
      policyRulesContract,
      setPolicyRulesContract
    }),
    [serviceList, setServiceList, serviceReadOnly, setServiceReadOnly, policyRulesContract, setPolicyRulesContract]
  );

  const { policyIngressContract } = useNetwork();

  useEffect(() => {
    if (policyIngressContract === undefined) {
      setPolicyRulesContract(undefined);
    } else {
      policyRulesFactory(policyIngressContract).then(contract => {
        setPolicyRulesContract(contract);
        contract.removeAllListeners('ServiceAdded');
        contract.removeAllListeners('ServiceRemoved');
        contract.removeAllListeners('ServiceUpdated');
        contract.on('ServiceAdded', (success, service, event) => {
          if (success) {
            loadServiceData(contract, setServiceList, setServiceReadOnly);
            console.log('EventAddded: ', service, event);
          }
        });
        contract.on('ServiceUpdated', (success, service, event) => {
          if (success) {
            loadServiceData(contract, setServiceList, setServiceReadOnly);
            console.log('LIST: ', serviceList);
          }
        });
        contract.on('ServiceRemoved', (success, service, event) => {
          if (success) {
            loadServiceData(contract, setServiceList, setServiceReadOnly);
            console.log('EventRemoved: ', event);
          }
        });
      });
    }
  }, [policyIngressContract, setServiceList, setServiceReadOnly]);

  return <ServiceDataContext.Provider value={value} {...props} />;
};

/**
 * Fetch the appropriate service data on chain and synchronize with it
 * @return {Object} Contains data of interest:
 *  - dataReady: true if isReadOnly and service allowlist are correctly fetched,
 *  false otherwise
 *  - userAddress: Address of the user
 *  - isReadOnly: Service contract is lock or unlock,
 *  - allowlist: list of permitted services from Service contract,
 */
export const useServiceData = () => {
  const context = useContext(ServiceDataContext);

  if (!context) {
    throw new Error('useServiceData must be used within an ServicesDataProvider.');
  }

  const { serviceList, setServiceList, serviceReadOnly, setServiceReadOnly, policyRulesContract } = context;
  //console.log("LIST: ", serviceList);
  useEffect(() => {
    loadServiceData(policyRulesContract, setServiceList, setServiceReadOnly);
  }, [policyRulesContract, setServiceList, setServiceReadOnly]);

  const formattedServiceList = useMemo(() => {
    return serviceList
      .map((service, i) => ({
        ...service,
        identifier: service.serviceId.toString(),

        status: 'active'
      }))
      .reverse();
  }, [serviceList]);
  console.log('SERVICELIST1---------------: ', formattedServiceList);

  const dataReady = useMemo(() => {
    return policyRulesContract !== undefined && serviceReadOnly !== undefined && serviceList !== undefined;
  }, [policyRulesContract, serviceReadOnly, serviceList]);

  return {
    dataReady,
    allowlist: formattedServiceList,
    isReadOnly: serviceReadOnly,
    policyRulesContract
  };
};
