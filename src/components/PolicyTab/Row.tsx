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

type PolicyRow = {
  address: string;
  hashedInfo: string;
  enrolled: boolean;
  status: string;
  isAdmin: boolean;
  deleteTransaction: (address: string) => void;
  openRemoveModal: (address: string) => void;
};

const PolicyRow: React.FC<PolicyRow> = ({
  address,
  status,
  hashedInfo,
  enrolled,
  isAdmin,
  deleteTransaction,
  openRemoveModal
}) => (
  <TableRow className={styles.row}>
    <TableCell>
      <TextWithTooltip status={status} text={address} isAdmin={isAdmin} />
    </TableCell>
    <TableCell>
      <TextWithTooltip status={status} text={hashedInfo} isAdmin={isAdmin} />
    </TableCell>
    <TableCell>
      <TextWithTooltip status={status} text={enrolled.toString()} isAdmin={isAdmin} />
    </TableCell>

    <TableCell>
      <Grid container justifyContent="space-between" alignItems="center">
        {enrolled === true ? (
          <Chip color="primary" className={styles.pill} label="Enrolled" />
        ) : status === 'active' ? (
          <Chip color="default" className={styles.pill} label="Not Enrolled" />
        ) : status === PENDING_ADDITION ? (
          <Chip color="secondary" className={styles.pill} label="Pending Addition" />
        ) : status === PENDING_REMOVAL ? (
          <Chip color="secondary" className={styles.pill} label="Pending Removal" />
        ) : status === FAIL_ADDITION ? (
          <Grid>
            <Chip className={styles.pill} label="Addition Failed" />
            <Chip color="secondary" className={styles.pill} onClick={() => deleteTransaction(address)} label="Clear" />
          </Grid>
        ) : status === FAIL_REMOVAL ? (
          <Grid>
            <Chip className={styles.pill} label="Removal Failed" />
            <Chip color="secondary" className={styles.pill} onClick={() => deleteTransaction(address)} label="Clear" />
          </Grid>
        ) : (
          <div />
        )}
        {isAdmin && status === 'active' && (
          <Chip className={styles.removeIcon} onDelete={() => openRemoveModal(address)} />
        )}
      </Grid>
    </TableCell>
  </TableRow>
);

PolicyRow.propTypes = {
  address: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  openRemoveModal: PropTypes.func.isRequired
};

export default PolicyRow;
