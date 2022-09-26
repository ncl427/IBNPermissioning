// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { TableContainer, Paper, Table, Box, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';
// Components
import PolicyTableHeader from './TableHeader';
import PolicyRow from './Row';
import EmptyRow from './EmptyRow';
import NotAdmin from '../NotAdmin/NotAdmin';

// Styles
import styles from './styles.module.scss';
//import { BigNumber } from 'ethers/utils';

type PolicyTable = {
  list: {
    policyId: string;
    policyRoles?: string;
    policyService?: string;
    policyProvider?: string;
    hashedInfo?: string;
    status: string;
  }[];
  toggleModal: (name: 'add' | 'remove' | 'lock') => (value?: boolean | string) => void;
  deleteTransaction: (identifier: string) => void;
  isAdmin: boolean;
  isReadOnly: boolean;
};

const PolicyTable: React.FC<PolicyTable> = ({ list, toggleModal, deleteTransaction, isAdmin, isReadOnly }) => (
  <Box mt={5}>
    <TableContainer component={Paper}>
      <PolicyTableHeader
        number={list.length}
        openAddModal={() => toggleModal('add')(true)}
        disabledAdd={!isAdmin || isReadOnly}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={styles.headerCell}>Policy Id</TableCell>
            <TableCell className={styles.headerCell}>Policy Roles</TableCell>
            <TableCell className={styles.headerCell}>Policy Service</TableCell>
            <TableCell className={styles.headerCell}>Policy Provider</TableCell>
            <TableCell className={styles.headerCell}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isAdmin ? list.map(({ policyId, policyRoles, policyService, policyProvider, status }) => (
            <PolicyRow
              key={policyId}
              policyId={policyId}
              policyRoles={policyRoles}
              policyService={policyService}
              policyProvider={policyProvider}
              status={status}
              isAdmin={isAdmin}
              deleteTransaction={deleteTransaction}
              openRemoveModal={toggleModal('remove')}
            />
          )): <NotAdmin/>}
          {list.length === 0 &&isAdmin && <EmptyRow />}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

PolicyTable.propTypes = {
  list: PropTypes.array.isRequired,
  toggleModal: PropTypes.func.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired
};

export default PolicyTable;
