import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../accounts';
import { getWordListOprions, routesPath } from '../../../utils';
import {
  Button,
  ChevronLeftIcon,
  CreatePasswordForm,
  Select,
} from '../../components';
import { createAccount } from '../../redux';
import Background from '../../services/Background';

type ImportSeedProps = {};

const options = getWordListOprions();

export const ImportSeed: React.FC<ImportSeedProps> = ({}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleBack = () => navigate(routesPath.SELECT_ACTION);

  const handleSubmit = (password: string) => async () => {
    await Background.initVault(password);
    await dispatch(createAccount({ seed: '', type: 'seed', name: 'Wallet 1' }));
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
        <div className="w-[192px]">
          <Select options={options} fieldName="2" label="#01" />
        </div>
        {/* <div className="w-[400px]">
          <CreatePasswordForm buttonTitle="Import" onClick={handleSubmit} />
        </div> */}
      </div>
    </div>
  );
};
