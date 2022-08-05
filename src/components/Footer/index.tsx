import React from 'react';
import { Grid } from '@material-ui/core';
import styles from './styles.module.scss';

const Footer: React.FC<{}> = () => {
  return (
    <Grid>
      <a href="http://172.18.102.169:3010" target="_blank" rel="noopener noreferrer" className={styles.footerLogo}>
        Created by ConsenSys
      </a>
    </Grid>
  );
};

export default Footer;
