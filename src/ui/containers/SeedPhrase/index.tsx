import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
    <Box
      sx={{
        width: '95%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingX: '5px',
      }}
    >
      <Typography sx={{ fontSize: '28px', color: 'red' }}>
        Please save this!!!
      </Typography>
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          border: '1px solid black',
          padding: '2px',
          borderRadius: '5px',
          marginY: '15px',
        }}
      >
        <Typography sx={{ fontSize: '18px', textAlign: 'center' }}>
          {newAccount.seed}
        </Typography>
      </Box>
      <Button variant="contained" onClick={handleNext}>
        Next
      </Button>
    </Box>
  );
};
