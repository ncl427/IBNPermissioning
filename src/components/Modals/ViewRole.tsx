// Libs
import React, { MouseEvent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Dialog,
  Button,
  DialogTitle,
  TextField,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography,
  Divider,
  Container
} from '@material-ui/core';
// Styles
import styles from './styles.module.scss';
import { ModalDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

const ViewModal: React.FC<{
  roleName: string;
  roleType: string;
  roleAttributes: string[];
  isOpen: boolean;
  closeModal: (e: MouseEvent) => void;
  display: ModalDisplay;
}> = ({
  roleName,
  roleType,
  roleAttributes,
  //modifyInput3,
  isOpen,
  closeModal,
  display
}) => (
  <Dialog open={isOpen} onClose={closeModal} aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">{display.heading}</DialogTitle>
    <DialogContent dividers>
      <DialogContentText>
        {display.subHeading}
        {display.label}
      </DialogContentText>
      <Container className={styles.bold}>
        <DialogContentText>{roleName}</DialogContentText>
      </Container>

      <DialogContentText>
        {display.subHeading}
        {display.label2}
      </DialogContentText>
      <Container className={styles.bold}>
        <DialogContentText>{roleType}</DialogContentText>
      </Container>
      <DialogContentText>
        {display.subHeading}
        {display.label3}
      </DialogContentText>
      <Container className={styles.bold}>
        <DialogContentText>{roleAttributes}</DialogContentText>
      </Container>

      <Typography gutterBottom></Typography>
    </DialogContent>

    <DialogActions>
      <Button onClick={closeModal}>Close</Button>
    </DialogActions>
  </Dialog>
);

ViewModal.propTypes = {
  roleName: PropTypes.string.isRequired,
  roleType: PropTypes.string.isRequired,
  roleAttributes: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  display: PropTypes.any.isRequired
};

export default ViewModal;
