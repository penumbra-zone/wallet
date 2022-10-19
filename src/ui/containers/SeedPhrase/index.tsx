import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../utils';
import { BackgroundType } from '../../../types';

type SeedPhraseProps = {
  background: BackgroundType;
};
export const SeedPhrase: React.FC<SeedPhraseProps> = ({ background }) => {
  const navigate = useNavigate();
  const { keys } = background.state;
  const handleNext = () => navigate(routes.INITIALIZE_SEED_PHRASE_CONFIRM);
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
          {keys[0] ? keys[0].mnemonic : ''}
        </Typography>
      </Box>
      <Button variant="contained" onClick={handleNext}>
        Next
      </Button>
    </Box>
  );
};
