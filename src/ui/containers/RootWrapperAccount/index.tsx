import { useLocation } from 'react-router-dom';
import { Logo } from '../../components';

type RootWrapperAccountProps = {
  children: React.ReactNode;
};

export const RootWrapperAccount: React.FC<RootWrapperAccountProps> = ({
  children,
}) => {
  const { pathname } = useLocation();

  const isHeader = pathname !== '/welcome';

  return (
    <div className="w-[100%] min-h-[100vh] flex flex-col items-center">
      <div className="w-[816px] flex flex-col">
        {!isHeader ? (
          <></>
        ) : (
          <div className="self-start mt-[20px]">
            <Logo size="medium" className="-ml-[16px]" />
          </div>
        )}
        <div
          className={`w-[100%] flex ${
            !isHeader ? 'min-h-[100vh]' : 'min-h-[calc(100vh-131px)]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
