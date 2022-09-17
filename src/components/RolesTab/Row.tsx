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

type RoleRow = {
  roleId: string;
  roleName: string;
  roleType: string;
  roleAttributes?: string[];
  status: string;
  isAdmin: boolean;
  deleteTransaction: (roleId: string) => void;
  openRemoveModal: (roleId: string) => void;
};

const RoleRow: React.FC<RoleRow> = ({
  roleId,
  status,
  roleName,
  roleType,
  roleAttributes,
  isAdmin,
  deleteTransaction,
  openRemoveModal
}) => (
  <TableRow className={styles.row}>
    <TableCell>
      <TextWithTooltip status={status} text={roleId} isAdmin={isAdmin} />
    </TableCell>
    <TableCell>
      <TextWithTooltip status={status} text={roleName} isAdmin={isAdmin} />
    </TableCell>
    <TableCell>
      <TextWithTooltip status={status} text={roleType} isAdmin={isAdmin} />
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
            <Chip color="secondary" className={styles.pill} onClick={() => deleteTransaction(roleId)} label="Clear" />
          </Grid>
        ) : status === FAIL_REMOVAL ? (
          <Grid>
            <Chip className={styles.pill} label="Removal Failed" />
            <Chip color="secondary" className={styles.pill} onClick={() => deleteTransaction(roleId)} label="Clear" />
          </Grid>
        ) : (
          <div />
        )}
        {isAdmin && status === 'active' && (
          <Chip className={styles.removeIcon} onDelete={() => openRemoveModal(roleId)} />
        )}
      </Grid>
    </TableCell>
  </TableRow>
);

RoleRow.propTypes = {
  status: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  openRemoveModal: PropTypes.func.isRequired
};

export default RoleRow;
