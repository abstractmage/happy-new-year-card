import { memo } from 'react';
import styles from '../index.module.css';

export const PolarLights = memo(function PolarLights() {
  return (
    <div className="absolute w-full h-full overflow-hidden">
      <div className={styles.aurora}></div>
      <div className={styles.aurora}></div>
      <div className={styles.aurora}></div>
    </div>
  );
});
