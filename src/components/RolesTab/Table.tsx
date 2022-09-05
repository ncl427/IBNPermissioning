// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { TableContainer, Paper, Table, Box, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';
// Components
import AccountTableHeader from './TableHeader';
import AccountRow from './Row';
import EmptyRow from './EmptyRow';
// Styles
import styles from './styles.module.scss';

type RolesTable = {
  list: { address: string; status: string; hashedInfo: string; enrolled: boolean }[];
  toggleModal: (name: 'add' | 'remove' | 'lock') => (value?: boolean | string) => void;
  deleteTransaction: (identifier: string) => void;
  isAdmin: boolean;
  isReadOnly: boolean;
};

const RolesTable: React.FC<RolesTable> = ({ list, toggleModal, deleteTransaction, isAdmin, isReadOnly }) => (
  <Box mt={5}>
    <TableContainer component={Paper}>
      <AccountTableHeader
        number={list.length}
        openAddModal={() => toggleModal('add')(true)}
        disabledAdd={!isAdmin || isReadOnly}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={styles.headerCell}>Role Name</TableCell>
            <TableCell className={styles.headerCell}>Role Atrributes</TableCell>
            {/*   <TableCell className={styles.headerCell}>Enrolled</TableCell>
            <TableCell className={styles.headerCell}>Status</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>IBN Manager</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Video Client</TableCell>
            <TableCell>Subscriber</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tester</TableCell>
            <TableCell>OTA</TableCell>
          </TableRow>
          {/*           {list.map(({ address, status, hashedInfo, enrolled }) => (
            <AccountRow
              key={address}
              address={address}
              hashedInfo={hashedInfo}
              enrolled={enrolled}
              status={status}
              isAdmin={isAdmin}
              deleteTransaction={deleteTransaction}
              openRemoveModal={toggleModal('remove')}
            />
          ))}
          {list.length === 0 && <EmptyRow />} */}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

RolesTable.propTypes = {
  list: PropTypes.array.isRequired,
  toggleModal: PropTypes.func.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired
};

export default RolesTable;
