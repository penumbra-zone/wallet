import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';

export const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div>
      <p>Welcome page</p>
      <button
        type="button"
        onClick={() => navigate(routesPath.RULES)}
      >
        Next
      </button>
    </div>
  );
};
