import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type MainProps = {
  background: any;
};

export const Main: React.FC<MainProps> = ({ background }) => {
  const { keys } = background.state;

  return (
    <Box>
      {keys[1] ? (
        <>
          <Typography sx={{ fontSize: '24px', wordWrap: 'break-word' }}>
            Spending key: {keys[1].spendKey}
          </Typography>
          <Typography sx={{ fontSize: '24px', wordWrap: 'break-word' }}>
            FVK: {keys[1].fvk}
          </Typography>
        </>
      ) : (
        <></>
      )}
    </Box>
  );
};
