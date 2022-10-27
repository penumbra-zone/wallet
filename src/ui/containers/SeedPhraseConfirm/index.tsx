import { useEffect, useMemo, useState } from 'react';
import { useAccountsSelector, useAppDispatch } from '../../../accounts';
import { createAccount, selectNewAccount } from '../../redux';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <p>Confirm your secret backup phrase</p>
      <p>Choose each phrase to make sure it is correct.</p>
      <div>
        <div>
          {selectedWords.map((i) => {
            return (
              <div key={i} onClick={deleteWord(i)}>
                <p>{i}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        {shufleMnemonic.map((i) => {
          return (
            <p key={i} onClick={addWord(i)}>
              {i}
            </p>
          );
        })}
      </div>
      <button disabled={disabledBtn} onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};
