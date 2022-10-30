import { useMemo } from 'react';
import img from '../../../assets/img/logo.png';

type LogoProps = {
  size: 'big' | 'medium' | 'small' |'small_tabs';
  className?: string
};

export const Logo: React.FC<LogoProps> = ({ size, className }) => {
  const cn = useMemo(() => {
    if (size === 'small') {
      return `w-[96px] ${className}`;
    } else if (size === 'small_tabs') {
      return `w-[108px] ${className}`;
    } else if (size === 'big') {
      return `w-[400px] ${className}`;
    } else if (size === 'medium') {
      return `w-[192px] ${className}`;
    }
  }, [size, className]);

  return <img src={img} alt="penumbra log" className={`${cn} object-cover`} />;
};
