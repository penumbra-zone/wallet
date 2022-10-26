import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { useAccountsSelector, useAppDispatch } from '../../../accounts';
import { createAccount, selectNewAccount } from '../../redux';
import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';

const shuffle = (array: string[]) => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

type SeedPhraseConfirmProps = {};

export const SeedPhraseConfirm: React.FC<SeedPhraseConfirmProps> = ({}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [disabledBtn, setDisabledBtn] = useState<boolean>(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const newAccount = useAccountsSelector(selectNewAccount);

  useEffect(() => {
    if (!newAccount.seed) return;
    const stringSelectedWords = selectedWords.join(' ');

    stringSelectedWords === newAccount.seed
      ? setDisabledBtn(false)
      : setDisabledBtn(true);
  }, [selectedWords, newAccount.seed]);

  const addWord = (word: string) => () => {
    if (selectedWords.includes(word)) return;
    setSelectedWords((state) => [...state, word]);
  };

  const deleteWord = (word: string) => () => {
    const withoutWord = selectedWords.filter((i) => i !== word);
    setSelectedWords(withoutWord);
  };

  const handleSubmit = async () => await dispatch(createAccount(newAccount));

  const shufleMnemonic = useMemo(() => {
    return shuffle(newAccount.seed.split(' '));
  }, [newAccount.seed]);

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingX: '5px',
      }}
    >
      <Typography sx={{ fontSize: '24px' }}>
        Confirm your secret backup phrase
      </Typography>
      <Typography sx={{ fontSize: '14px' }}>
        Choose each phrase to make sure it is correct.
      </Typography>
      <Box
        sx={{
          minHeight: '180px',
          width: '100%',
          border: '1px solid black',
          borderRadius: '5px',
          marginY: '10px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            padding: '4px',
          }}
        >
          {selectedWords.map((i) => {
            return (
              <Box
                key={i}
                sx={{
                  flex: '0 0 25%',
                  textAlign: 'center',
                  border: '1px solid black',
                  padding: '2px',
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
                onClick={deleteWord(i)}
              >
                <Box>{i}</Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {shufleMnemonic.map((i) => {
          return (
            <Box
              key={i}
              sx={{
                flex: '0 0 20%',
                textAlign: 'center',
                border: '1px solid black',
                padding: '2px',
                borderRadius: '5px',
                fontSize: '14px',
                background: selectedWords.includes(i) ? '#42a5f5' : '',
              }}
              onClick={addWord(i)}
            >
              {i}
            </Box>
          );
        })}
      </Box>
      <Button
        variant="contained"
        // TODO unCommit
        // disabled={disabledBtn}
        sx={{ marginTop: '10px' }}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Box>
  );
};
