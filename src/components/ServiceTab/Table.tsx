// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { TableContainer, Paper, Table, Box, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';
// Components
import ServiceTableHeader from './TableHeader';
import ServiceRow from './Row';
import EmptyRow from './EmptyRow';
// Styles
import styles from './styles.module.scss';
//import { BigNumber } from 'ethers/utils';

type ServicesTable = {
  list: {
    serviceId: string;
    serviceName: string;
    serviceDescription: string;
    serviceConfig: string[];
    status: string;
  }[];
  toggleModal: (name: 'add' | 'remove' | 'lock') => (value?: boolean | string) => void;
  deleteTransaction: (identifier: string) => void;
  isAdmin: boolean;
  isReadOnly: boolean;
};

const ServicesTable: React.FC<ServicesTable> = ({ list, toggleModal, deleteTransaction, isAdmin, isReadOnly }) => (
  <Box mt={5}>
    <TableContainer component={Paper}>
      <ServiceTableHeader
        number={list.length}
        openAddModal={() => toggleModal('add')(true)}
        disabledAdd={!isAdmin || isReadOnly}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={styles.headerCell}>Service Id</TableCell>
            <TableCell className={styles.headerCell}>Service Name</TableCell>
            <TableCell className={styles.headerCell}>Service Description</TableCell>
            <TableCell className={styles.headerCell}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(({ serviceId, serviceName, serviceDescription, serviceConfig, status }) => (
            <ServiceRow
              key={serviceId}
              serviceId={serviceId}
              serviceName={serviceName}
              serviceDescription={serviceDescription}
              serviceConfig={serviceConfig}
              status={status}
              isAdmin={isAdmin}
              deleteTransaction={deleteTransaction}
              openRemoveModal={toggleModal('remove')}
            />
          ))}
          {list.length === 0 && <EmptyRow />}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

ServicesTable.propTypes = {
  list: PropTypes.array.isRequired,
  toggleModal: PropTypes.func.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired
};

export default ServicesTable;
