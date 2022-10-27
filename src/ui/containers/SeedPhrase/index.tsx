import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { useEffect } from 'react';
import { getSeedPhrase } from '../../../utils/getSeedPhrase';
import { useAccountsSelector, useAppDispatch } from '../../../accounts';
import { localStateActions, selectNewAccount } from '../../redux';

type SeedPhraseProps = {};

export const SeedPhrase: React.FC<SeedPhraseProps> = ({}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const newAccount = useAccountsSelector(selectNewAccount);
  const handleNext = () => navigate(routesPath.CONFIRM_SEED_PHRASE);

  useEffect(() => {
    const seed = getSeedPhrase();

    dispatch(
      localStateActions.setNewAccount({
        seed,
        type: 'seed',
      })
    );
  }, []);

  return (
    <div>
      <p>Please save this!!!</p>
      <div>
        <p>{newAccount.seed}</p>
      </div>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};
