// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Grid, TableCell, TableRow } from '@material-ui/core';
// Constant
import { PENDING_ADDITION, PENDING_REMOVAL, FAIL_ADDITION, FAIL_REMOVAL } from '../../constants/transactions';
// Components
import TextWithTooltip from './TextWithTooltip';
// Styles
import styles from './styles.module.scss';
//import { BigNumber } from 'ethers/utils';

type ServiceRow = {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  serviceConfig?: string[];
  status: string;
  isAdmin: boolean;
  deleteTransaction: (serviceId: string) => void;
  openRemoveModal: (serviceId: string) => void;
};

const ServiceRow: React.FC<ServiceRow> = ({
  serviceId,
  status,
  serviceName,
  serviceDescription,
  serviceConfig,
  isAdmin,
  deleteTransaction,
  openRemoveModal
}) => (
  <TableRow className={styles.row}>
    <TableCell>
      <TextWithTooltip status={status} text={serviceId} isAdmin={isAdmin} />
    </TableCell>
    <TableCell>
      <TextWithTooltip status={status} text={serviceName} isAdmin={isAdmin} />
    </TableCell>
    <TableCell>
      <TextWithTooltip status={status} text={serviceDescription} isAdmin={isAdmin} />
    </TableCell>

    <TableCell>
      <Grid container justifyContent="space-between" alignItems="center">
        {status === 'active' ? (
          <Chip color="default" className={styles.pill} label="Active" />
        ) : status === PENDING_ADDITION ? (
          <Chip color="secondary" className={styles.pill} label="Pending Addition" />
        ) : status === PENDING_REMOVAL ? (
          <Chip color="secondary" className={styles.pill} label="Pending Removal" />
        ) : status === FAIL_ADDITION ? (
          <Grid>
            <Chip className={styles.pill} label="Addition Failed" />
            <Chip
              color="secondary"
              className={styles.pill}
              onClick={() => deleteTransaction(serviceId)}
              label="Clear"
            />
          </Grid>
        ) : status === FAIL_REMOVAL ? (
          <Grid>
            <Chip className={styles.pill} label="Removal Failed" />
            <Chip
              color="secondary"
              className={styles.pill}
              onClick={() => deleteTransaction(serviceId)}
              label="Clear"
            />
          </Grid>
        ) : (
          <div />
        )}
        {isAdmin && status === 'active' && (
          <Chip className={styles.removeIcon} onDelete={() => openRemoveModal(serviceId)} />
        )}
      </Grid>
    </TableCell>
  </TableRow>
);

ServiceRow.propTypes = {
  status: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  openRemoveModal: PropTypes.func.isRequired
};

export default ServiceRow;
