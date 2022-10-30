import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../accounts';
import { getWordListOprions, routesPath } from '../../../utils';
import {
  Button,
  ChevronLeftIcon,
  CreatePasswordForm,
  InformationOutlineSvg,
  Select,
} from '../../components';
import { createAccount, localStateActions } from '../../redux';
import Background from '../../services/Background';
const bip39 = require('bip39');

type ImportSeedProps = {};

const options = getWordListOprions();

const selects = [...Array(24).keys()];

export const ImportSeed: React.FC<ImportSeedProps> = ({}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [seed, setSeed] = useState({});
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean>(true);

  const handleBack = () => navigate(routesPath.SELECT_ACTION);
  const handleChange = (index: number) => (value: string) => {
    setSeed((state) => ({
      ...state,
      [index]: value,
    }));
  };

  const handleSubmit = (password: string) => async () => {
    const seedStr = Object.values(seed).join(' ');
    const isValidate = bip39.validateMnemonic(seedStr);

    setIsValidMnemonic(isValidate);

    if (Object.values(seed).length !== 24) {
      setIsValidMnemonic(false);
    }
    if (!isValidate || Object.values(seed).length !== 24) return;
    await dispatch(
      localStateActions.setNewAccount({
        seed: seedStr,
        type: 'seed',
      })
    );
    await Background.initVault(password);
    await dispatch(
      createAccount({ seed: seedStr, type: 'seed', name: 'Wallet 1' })
    );
  };

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[816px] flex flex-col  justify-center">
        <div>
          <Button
            mode="icon_transparent"
            onClick={handleBack}
            title="Back"
            iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
          />
        </div>
        <p className="h1 mt-[40px] mb-[24px]">
          Import wallet with recovery passphrase
        </p>
        <div className="flex flex-wrap gap-y-[8px] gap-x-[16px]">
          {selects.map((i) => (
            <div className="flex-[0_0_calc(25%-16px)]" key={i}>
              <Select
                options={options}
                fieldName={String(i)}
                label={`#${i + 1 < 10 ? `0${i + 1}` : i + 1}`}
                handleChange={handleChange(i)}
              />
            </div>
          ))}
        </div>
        {!isValidMnemonic && (
          <div className="flex items-center bg-brown py-[23px] pl-[14px] w-[calc(50%-16px)] rounded-[15px] border-[1px] border-solid border-red mt-[20px]">
            <InformationOutlineSvg fill="#870606" />
            <p className="pl-[18px] text _body">Invalid recovery passphrase.</p>
          </div>
        )}
        <div className="w-[calc(50%-16px)] mt-[40px]">
          <CreatePasswordForm buttonTitle="Import" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};
