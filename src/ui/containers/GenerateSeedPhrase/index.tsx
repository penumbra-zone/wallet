import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type GenerateSeedPhraseProps = {
  mnemonic: string;
  handleChangeStep: () => void;
};
export const GenerateSeedPhrase: React.FC<GenerateSeedPhraseProps> = ({
  mnemonic,
  handleChangeStep,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
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
          {mnemonic}
        </Typography>
      </Box>
      <Button variant="contained" onClick={handleChangeStep}>
        Next
      </Button>
    </Box>
  );
};
