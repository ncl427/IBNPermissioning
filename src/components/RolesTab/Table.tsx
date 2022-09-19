// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { TableContainer, Paper, Table, Box, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';
// Components
import RoleTableHeader from './TableHeader';
import RoleRow from './Row';
import EmptyRow from './EmptyRow';
// Styles
import styles from './styles.module.scss';
//import { BigNumber } from 'ethers/utils';

type RolesTable = {
  list: { roleId: string; roleName: string; roleType: string; roleAttributes: string[]; status: string }[];
  toggleModal: (name: 'add' | 'remove' | 'lock' | 'view') => (value?: boolean | string) => void;
  deleteTransaction: (identifier: string) => void;
  isAdmin: boolean;
  isReadOnly: boolean;
};

const RolesTable: React.FC<RolesTable> = ({ list, toggleModal, deleteTransaction, isAdmin, isReadOnly }) => (
  <Box mt={5}>
    <TableContainer component={Paper}>
      <RoleTableHeader
        number={list.length}
        openAddModal={() => toggleModal('add')(true)}
        disabledAdd={!isAdmin || isReadOnly}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={styles.headerCell}>Role Id</TableCell>
            <TableCell className={styles.headerCell}>Role Name</TableCell>
            <TableCell className={styles.headerCell}>Role Type</TableCell>
            <TableCell className={styles.headerCell}>Status</TableCell>
            {/*   <TableCell className={styles.headerCell}>Enrolled</TableCell>
            <TableCell className={styles.headerCell}>Status</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(({ roleId, roleName, roleType, roleAttributes, status }) => (
            <RoleRow
              key={roleId}
              roleId={roleId}
              roleName={roleName}
              roleType={roleType}
              roleAttributes={roleAttributes}
              status={status}
              isAdmin={isAdmin}
              deleteTransaction={deleteTransaction}
              openViewModal={toggleModal('view')}
              openRemoveModal={toggleModal('remove')}
            />
          ))}
          {list.length === 0 && <EmptyRow />}
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
