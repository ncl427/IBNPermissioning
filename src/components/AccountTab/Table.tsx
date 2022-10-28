// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { TableContainer, Paper, Table, Box, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';
// Components
import AccountTableHeader from './TableHeader';
import AccountRow from './Row';
import EmptyRow from './EmptyRow';
import NotAdmin from '../NotAdmin/NotAdmin';
// Styles
import styles from './styles.module.scss';

type AccountTable = {
  list: { address: string; status: string; hashedInfo: string; enrolled: boolean; idType: string }[];
  toggleModal: (name: 'add' | 'remove' | 'lock' | 'view') => (value?: boolean | string) => void;
  deleteTransaction: (identifier: string) => void;
  isAdmin: boolean;
  isReadOnly: boolean;
};

const AccountTable: React.FC<AccountTable> = ({ list, toggleModal, deleteTransaction, isAdmin, isReadOnly }) => (
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
            <TableCell className={styles.headerCell}>Account Address</TableCell>
            <TableCell className={styles.headerCell}>Identity Hash</TableCell>
            <TableCell className={styles.headerCell}>Type</TableCell>
            <TableCell className={styles.headerCell}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isAdmin ? (
            list.map(({ address, status, hashedInfo, enrolled, idType }) => (
              <AccountRow
                key={address}
                address={address}
                hashedInfo={hashedInfo}
                enrolled={enrolled}
                idType={idType}
                status={status}
                isAdmin={isAdmin}
                deleteTransaction={deleteTransaction}
                openViewModal={toggleModal('view')}
                openRemoveModal={toggleModal('remove')}
              />
            ))
          ) : (
            <NotAdmin />
          )}
          {list.length === 0 && isAdmin && <EmptyRow />}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

AccountTable.propTypes = {
  list: PropTypes.array.isRequired,
  toggleModal: PropTypes.func.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired
};

export default AccountTable;
