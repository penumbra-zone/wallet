import { Fragment } from 'react';
import { PasswordValidatorsType } from '../../../utils';
import { CheckSvg, CloseSvg } from '../Svg';

type PasswordRulesProps = {
  password: string;
  validates: PasswordValidatorsType;
};

const Rule = ({ password, validateRules, text }) => {
  return (
    <p
      className={`mb-[2px] flex items-center ${
        !password
          ? 'text-light_grey'
          : validateRules
          ? 'text-green'
          : 'text-red'
      }`}
    >
      <span className="mr-[6px]">
        {validateRules ? (
          <CheckSvg width="12" height="12" fill="#368E00" />
        ) : (
          <CloseSvg fill={!password ? '#E0E0E0' : '#870606'} />
        )}
      </span>
      {text}
    </p>
  );
};

export const PasswordRules: React.FC<PasswordRulesProps> = ({
  password,
  validates,
}) => {
  const array = [
    {
      id: 1,
      text: 'Must be at least 8 characters.',
      validateRules: validates.isEightLength,
    },
    {
      id: 2,
      text: 'At least one uppercase character.',
      validateRules: validates.isUpper,
    },
    {
      id: 3,
      text: 'At least one lowercase character.',
      validateRules: validates.isLower,
    },
    { id: 4, text: 'At least one number.', validateRules: validates.isDigit },
    { id: 5, text: 'At least one symbol.', validateRules: validates.isSymbol },
  ];

  return (
    <div className="flex flex-col self-start text_body text-light_grey">
      <p className=" mb-[12px]">
        We will use this password to encrypt your data. You will need this
        password to unlock your wallet.
      </p>
      {array.map((i) => (
        <Fragment key={i.id}>
          <Rule
            password={password}
            validateRules={i.validateRules}
            text={i.text}
          />
        </Fragment>
      ))}
    </div>
  );
};
