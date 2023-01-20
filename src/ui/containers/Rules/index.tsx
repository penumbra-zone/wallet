import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { Button, CheckSvg, CloseSvg } from '../../components';

export const Rules = () => {
  const navigate = useNavigate();

  const handleNext = () => navigate(routesPath.SELECT_ACTION);

  return (
    <div className="w-[100%] flex items-center justify-center mt-[40px] mb-[30px]">
      <div className="flex flex-col justify-center">
        <p className="h1 mb-[16px]">Help us to improve Penumbra</p>
        <p className="text_body text-light_grey mb-[16px]">
          Penumbra would like to collect basic usage data to better understand
          how our users interact with the extension. This data will be used to
          continuously improve the usability and experience of using our product
          and the Penumbra ecosystem.
        </p>
        <p className="text_body text-light_grey mb-[12px]">Penumbra... </p>
        <div className="flex  mb-[60px]">
          <div className="flex flex-col">
            <div className="flex items-center mb-[6px]">
              <CheckSvg fill="#368E00" />
              <p className="text_body text-light_grey ml-[8px]">
                Always allow you to opt out in Settings
              </p>
            </div>
            <div className="flex items-center">
              <CheckSvg fill="#368E00" />
              <p className="text_body text-light_grey ml-[8px]">
                Send anonymized click and pageview events
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center mb-[6px]">
              <CloseSvg width="20" height="20" />
              <p className="text_body text-light_grey ml-[8px]">
                Never stores keys, addresses, transactions, balances, hashes
              </p>
            </div>
            <div className="flex items-center  mb-[6px]">
              <CloseSvg width="20" height="20" />
              <p className="text_body text-light_grey ml-[8px]">
                Never saves your full IP address
              </p>
            </div>
            <div className="flex items-center">
              <CloseSvg width="20" height="20" />
              <p className="text_body text-light_grey ml-[8px]">
                Never sells data for profit. Never!
              </p>
            </div>
          </div>
        </div>
        <div className="w-[100%] flex">
          <Button
            mode="gradient"
            onClick={handleNext}
            title="I agree"
            className="mr-[8px]"
          />
          <Button
            mode="transparent"
            onClick={handleNext}
            title="No, thanks"
            className=" ml-[8px]"
          />
        </div>
        <div className="text_body mt-[24px] text-light_grey">
          This data is aggregated and is therefore anonymous for the purposes of
          General Data Protection Regulation (EU) 2016/679. For more information
          in relation to our privacy practices, please see our{' '}
          <span>
            <a
              className="text-green underline cursor-pointer hover:text-light_grey"
              target="_blank"
              href="https://privacy.penumbra.zpoken.io/"
            >
              Privacy policy here.
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
