import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';

export const SelectAction: React.FC<{}> = () => {
  const navigate = useNavigate();

  const handleNavigate = (link: string) => () => navigate(link);
  return (
    <div>
      <p>Welcome to Penumbra wallet</p>
      <div>
        <button onClick={handleNavigate(routesPath.CREATE_PASSWORD)}>
          Create new wallet
        </button>
        <button onClick={handleNavigate(routesPath.IMPORT_SEED_PHRASE)}>
          Wallet recovery
        </button>
      </div>
    </div>
  );
};
