import { identifierToEnodeId } from '../util/enodetools';

export type ModalDisplay = {
  heading: string;
  subHeading: string;
  label?: string;
  inputPlaceholder?: string;
  input2Placeholder?: string;
  input3Placeholder?: string;
  errorMessage?: string;
  submitText?: string;
};

export const addAdminDisplay: ModalDisplay = {
  submitText: 'Add Admin Account',
  errorMessage: 'Account address is not valid.',
  inputPlaceholder: 'Ex: 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A',
  label: 'Account Address',
  heading: 'Add Admin Account',
  subHeading: ''
};

export const removeAdminDisplay: (value: string | boolean) => ModalDisplay = value => ({
  heading: 'Are you sure?',
  subHeading: `Remove “${value}” as an admin account?`
});

export const addAccountDisplay: ModalDisplay = {
  submitText: 'Add Account',
  errorMessage: 'Account address is not valid.',
  inputPlaceholder: 'Ex: 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A',
  label: 'Account Address',
  heading: 'Add Account',
  subHeading: ''
};

export const addPolicyDisplay: ModalDisplay = {
  submitText: 'Add Policy',
  errorMessage: 'Policy is not valid.',
  inputPlaceholder: 'Ex: 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A',
  label: 'Policy Id',
  heading: 'Add Policy',
  subHeading: ''
};

export const addRoleDisplay: ModalDisplay = {
  submitText: 'Add Role',
  errorMessage: 'Role is not valid.',
  inputPlaceholder: 'Ex: Video Client',
  input2Placeholder: 'Ex: Valid Numbers',
  input3Placeholder: 'Ex: Expiration Time in Seconds',
  label: 'Adding roles to the ZT&T system',
  heading: 'Add Role',
  subHeading: ''
};

export const addServiceDisplay: ModalDisplay = {
  submitText: 'Add Service',
  errorMessage: 'Service is not valid.',
  inputPlaceholder: 'Ex: 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A',
  label: 'Service Id',
  heading: 'Add Service',
  subHeading: ''
};

export const removeAccountDisplay: (value: string | boolean) => ModalDisplay = value => ({
  heading: 'Are you sure?',
  subHeading: `Remove account “${value}”?`
});

export const removePolicyDisplay: (value: string | boolean) => ModalDisplay = value => ({
  heading: 'Are you sure?',
  subHeading: `Remove policy “${value}”?`
});

export const removeRoleDisplay: (value: string | boolean) => ModalDisplay = value => ({
  heading: 'Are you sure?',
  subHeading: `Remove role “${value}”?`
});

export const removeServiceDisplay: (value: string | boolean) => ModalDisplay = value => ({
  heading: 'Are you sure?',
  subHeading: `Remove service “${value}”?`
});

export const addEnodeDisplay: ModalDisplay = {
  submitText: 'Add Node',
  errorMessage: 'Enode URL must include valid Node ID, Host name (IP address or DNS name) and Port.',
  inputPlaceholder:
    'Ex: enode://72b0d3ee9e86e072cca078b2588163bf8d9b85fa93923a31f4b97d13cf5280b3d32de9c13d4b7e3cc615d8c1347c97da760a689fac05d9ec80bda4517015ee78@127.0.0.1:30304',
  label: 'Enode URL',
  heading: 'Add Node',
  subHeading: ''
};

export const removeEnodeDisplay: (value: string) => ModalDisplay = value => ({
  heading: 'Are you sure?',
  subHeading: `Remove node “${identifierToEnodeId(value)}”?`
});
