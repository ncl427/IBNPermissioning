// Libs
import { TableCell, TableRow } from '@material-ui/core';
import React from 'react';
// Styles
import styles from './styles.module.scss';

const NotAdmin: React.FC<{}> = () => (
  <TableRow>
    <TableCell colSpan={2} className={styles.emptyLine}>
      You must be an admin to see this information.
    </TableCell>
  </TableRow>
);

export default NotAdmin;
