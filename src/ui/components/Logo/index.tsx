import { useMemo } from 'react';
import img from '../../../assets/img/logo.png';

type LogoProps = {
  size: 'big' | 'medium' | 'small';
};

export const Logo: React.FC<LogoProps> = ({ size }) => {
  const cn = useMemo(() => {
    if (size === 'small') {
      return 'w-[96px]';
    } else if (size === 'big') {
      return 'w-[400px]';
    } else if (size === 'medium') {
      return 'w-[192px]';
    }
  }, [size]);

  return <img src={img} alt="penumbra log" className={`${cn} object-cover`} />;
};
