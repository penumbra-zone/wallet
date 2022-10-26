import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';

export const SelectAction: React.FC<{}> = () => {
  const navigate = useNavigate();

  const handleNavigate = (link: string) => () => navigate(link);
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography sx={{ fontSize: '24px', marginBottom: '10px' }}>
        Welcome to Penumbra wallet
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingX: '5px',
        }}
      >
        <Button
          variant="contained"
          sx={{ marginRight: '2.5px' }}
          onClick={handleNavigate(routesPath.CREATE_PASSWORD)}
        >
          Create new wallet
        </Button>
        <Button
          variant="outlined"
          sx={{ marginLeft: '2.5px' }}
          onClick={handleNavigate(routesPath.IMPORT_SEED_PHRASE)}
        >
          Wallet recovery
        </Button>
      </Box>
    </Box>
  );
};
