// Libs
import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { AccountDataProvider } from '../../context/accountData';
import { RolesDataProvider } from '../../context/rolesData';
import { ServicesDataProvider } from '../../context/serviceData';
import { PolicyDataProvider } from '../../context/policyData';
import { AdminDataProvider } from '../../context/adminData';
import { NodeDataProvider } from '../../context/nodeData';
// Components
import TabSelector from './TabSelector';
import Toasts from '../../containers/Toasts/Toasts';
import AccountTab from '../../containers/Tabs/Account';
import RoleTab from '../../containers/Tabs/Roles';
import ServiceTab from '../../containers/Tabs/Service';
import PolicyTab from '../../containers/Tabs/Policy';
import AdminTab from '../../containers/Tabs/Admin';
import EnodeTab from '../../containers/Tabs/Enode';
// Context
import { ToastProvider } from '../../context/toasts';
// Constants
import { ACCOUNT_TAB, ADMIN_TAB, ENODE_TAB, ROLES_TAB, SERVICES_TAB, POLICY_TAB } from '../../constants/tabs';

type Dashboard = {
  tab: string;
  setTab: (tab: string) => void;
};

const Dashboard: React.FC<Dashboard> = ({ tab, setTab }) => (
  <Fragment>
    <TabSelector setTab={setTab} tab={tab} />
    {
      <ToastProvider>
        <Toasts />
        <AdminDataProvider>
          <AccountDataProvider>
            <AccountTab isOpen={tab === ACCOUNT_TAB} />
          </AccountDataProvider>
          <RolesDataProvider>
            <RoleTab isOpen={tab === ROLES_TAB} />
          </RolesDataProvider>
          <ServicesDataProvider>
            <ServiceTab isOpen={tab === SERVICES_TAB} />
          </ServicesDataProvider>
          <PolicyDataProvider>
            <PolicyTab isOpen={tab === POLICY_TAB} />
          </PolicyDataProvider>

          <AdminTab isOpen={tab === ADMIN_TAB} />
          {/*           <NodeDataProvider>
            <EnodeTab isOpen={tab === ENODE_TAB} />
          </NodeDataProvider> */}
        </AdminDataProvider>
      </ToastProvider>
    }
  </Fragment>
);

Dashboard.propTypes = {
  setTab: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired
};

export default memo(Dashboard);
