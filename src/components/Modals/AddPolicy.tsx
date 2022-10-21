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
  Container,
  Autocomplete
} from '@material-ui/core';
// Styles
import styles from './styles.module.scss';
import { ModalDisplay } from '../../constants/modals';
import { MultiSelect } from '../MultiSelect/MultiSelect';

//import { BigNumber } from 'ethers/utils';
type Item = {
  id: string;
  itemId?: string;
  value: string;
};

const AddModal: React.FC<{
  input: string;
  input2: string;
  input3: string;
  items: any[];
  serviceItems: any[];
  identityItems: any[];
  validationResult: { valid: boolean; msg?: string };
  modifyInput: (input: { target: { value: string } }) => void;
  modifyInput2: (input2: { target: { value: string } }) => void;
  modifyInput3: (input3: { target: { value: string } }) => void;
  handleChange: (event: any, newValue: string | null) => void;
  handleChangeProvider: (event: any, newValue: string | null) => void;
  handleChangeValue: (e: Item[]) => void;
  handleSubmit: (e: MouseEvent) => void;
  isOpen: boolean;
  closeModal: (e: MouseEvent) => void;
  display: ModalDisplay;
}> = ({
  input,
  input2,
  input3,
  items,
  serviceItems,
  identityItems,
  validationResult,
  modifyInput,
  modifyInput2,
  modifyInput3,
  handleSubmit,
  handleChangeValue,
  handleChangeProvider,
  handleChange,
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

      {/*       <TextField
        autoFocus
        label="List of Role Ids"
        placeholder={display.inputPlaceholder}
        value={input}
        onChange={modifyInput}
        className={styles.fieldInput}
        required
        fullWidth
      /> */}

      <Autocomplete
        disablePortal
        id="service-types-combo"
        options={serviceItems}
        onChange={handleChange}
        sx={{ width: 300 }}
        renderInput={params => <TextField {...params} label="Select a Service" />}
      />
      {/*     <TextField
          label="Service Id"
          placeholder={display.input2Placeholder}
          value={input2}
          onChange={modifyInput2}
          className={styles.fieldInput}
          required
          fullWidth
        /> */}

      <Autocomplete
        disablePortal
        id="provider-types-combo"
        options={identityItems}
        onChange={handleChangeProvider}
        sx={{ width: 300 }}
        renderInput={params => <TextField {...params} label="Select a Provider" />}
      />
      {/*         <TextField
          label="Provider Address"
          placeholder={display.input3Placeholder}
          value={input3}
          onChange={modifyInput3}
          className={styles.fieldInput}
          required
          fullWidth
        /> */}
      <Container className={styles.bold}>
        <MultiSelect
          items={items}
          placeholder="Select a Role"
          selectedItemsThis={[]}
          handleChangeValue={handleChangeValue}
        />
      </Container>
      {/*         <Typography
          gutterBottom
          className={
            !validationResult.valid ? classnames(styles.errorMessage, styles.show) : styles.errorMessage
          }
        >
          {validationResult.msg ? validationResult.msg : display.errorMessage}
        </Typography> */}
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
  items: PropTypes.array.isRequired,
  serviceItems: PropTypes.array.isRequired,
  identityItems: PropTypes.array.isRequired,
  handleChangeValue: PropTypes.func.isRequired,
  handleChangeProvider: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  validationResult: PropTypes.any.isRequired,
  modifyInput: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  display: PropTypes.any.isRequired
};

export default AddModal;
