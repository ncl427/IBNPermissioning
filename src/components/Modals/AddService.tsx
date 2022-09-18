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
  Typography
} from '@material-ui/core';
// Styles
import styles from './styles.module.scss';
import { ModalDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

const AddModal: React.FC<{
  input: string;
  input2: string;
  input3: string;
  validationResult: { valid: boolean; msg?: string };
  modifyInput: (input: { target: { value: string } }) => void;
  modifyInput2: (input2: { target: { value: string } }) => void;
  modifyInput3: (input3: { target: { value: string } }) => void;
  handleSubmit: (e: MouseEvent) => void;
  isOpen: boolean;
  closeModal: (e: MouseEvent) => void;
  display: ModalDisplay;
}> = ({
  input,
  input2,
  input3,
  validationResult,
  modifyInput,
  modifyInput2,
  modifyInput3,
  handleSubmit,
  isOpen,
  closeModal,
  display
}) => (
  <Dialog open={isOpen} onClose={closeModal} aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">{display.heading}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {display.subHeading}
        {display.label}
      </DialogContentText>
      <TextField
        autoFocus
        label="Service Name"
        placeholder={display.inputPlaceholder}
        value={input}
        onChange={modifyInput}
        className={styles.fieldInput}
        required
        fullWidth
      />
      <TextField
        label="Service Description"
        placeholder={display.input2Placeholder}
        value={input2}
        onChange={modifyInput2}
        className={styles.fieldInput}
        required
        fullWidth
      />
      <TextField
        label="Service Configurations"
        placeholder={display.input3Placeholder}
        value={input3}
        onChange={modifyInput3}
        className={styles.fieldInput}
        required
        fullWidth
      />
      <Typography
        gutterBottom
        className={
          !validationResult.valid && input ? classnames(styles.errorMessage, styles.show) : styles.errorMessage
        }
      >
        {validationResult.msg ? validationResult.msg : display.errorMessage}
      </Typography>
    </DialogContent>

    <DialogActions>
      <Button onClick={closeModal}>Cancel</Button>
      <Button disabled={!validationResult.valid} color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </DialogActions>
  </Dialog>
);

AddModal.propTypes = {
  input: PropTypes.string.isRequired,
  input2: PropTypes.string.isRequired,
  input3: PropTypes.string.isRequired,
  validationResult: PropTypes.any.isRequired,
  modifyInput: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  display: PropTypes.any.isRequired
};

export default AddModal;
