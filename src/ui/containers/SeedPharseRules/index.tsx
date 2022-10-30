import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../accounts';
import { routesPath } from '../../../utils';
import { Button } from '../../components';
import { accountsActions } from '../../redux';

export const SeedPharseRules = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //logic to show popup after create
  useEffect(() => {
    dispatch(accountsActions.setRedirectAccountPage(false));
  }, []);

  const tips = [
    {
      header: 'What is a recovery passphrase?',
      children: (
        <p className="text_body text-center text-light_grey">
          Your recovery passphrase is a 24-word phrase that is the «master key»
          to your wallet and your funds.
        </p>
      ),
    },
    {
      header: 'How do I store my recovery passphrase?',
      children: (
        <div className="ml-[36px]">
          <div className="text_body text-light_grey mb-[2px] flex items-center">
            <span className="w-[4px] h-[4px] li_gradient mr-[8px] rounded-[50%]"></span>
            <p>Save to password manager.</p>
          </div>
          <div className="text_body text-light_grey mb-[2px] flex items-center">
            <span className="w-[4px] h-[4px] li_gradient mr-[8px] rounded-[50%]"></span>
            <p>Keep in a bank vault.</p>
          </div>
          <div className="text_body text-light_grey mb-[2px] flex items-center">
            <span className="w-[4px] h-[4px] li_gradient mr-[8px] rounded-[50%]"></span>
            <p>Keep in a safe deposit box.</p>
          </div>
          <div className="text_body text-light_grey flex items-center">
            <span className="w-[4px] h-[4px] li_gradient mr-[8px] rounded-[50%]"></span>
            <p>Record and store in several secret places.</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Can I share my recovery passphrase with anyone?',
      children: (
        <p className="text_body text-center text-light_grey">
          Never share your recovery passphrase with anyone, not even Penumbra
          employees!
        </p>
      ),
    },
  ];

  const handleStart = () => navigate(routesPath.SEED_PHRASE);

  return (
    <div className="w-[100%] flex flex-col items-center justify-center">
      <p className="h1 mb-[16px]">Protect your wallet</p>
      <div className="flex items-stretch flex-wrap justify-center -mx-[8px]">
        {tips.map((i, index) => {
          return (
            <div
              key={index}
              className="border-[1px] border-solid border-dark_grey rounded-[15px] flex-[0_0_48%] mt-[24px] mx-[8px] px-[14px] pt-[24px] pb-[48px] py-[24px] bg-brown"
            >
              <p className="h2 text-center mb-[16px]">{i.header}</p>
              {i.children}
            </div>
          );
        })}
      </div>
      <div className="w-[48%] mt-[40px] mb-[40px]  mx-[8px]">
        <Button title="Start" mode="gradient" onClick={handleStart} />
      </div>
    </div>
  );
};
