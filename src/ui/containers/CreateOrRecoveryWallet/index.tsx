import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

type CreateOrRecoveryWalletProps = {
  handleChangeStep: () => void;
};

export const CreateOrRecoveryWallet: React.FC<CreateOrRecoveryWalletProps> = ({
  handleChangeStep,
}) => {
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
          onClick={handleChangeStep}
          sx={{ marginRight: '2.5px' }}
        >
          Create new wallet
        </Button>
        <Button variant="outlined" sx={{ marginLeft: '2.5px' }}>
          Wallet recovery
        </Button>
      </Box>
    </Box>
  );
};
