import { useAccountsSelector } from '../../../accounts';
import { useMediaQuery } from '../../../hooks';
import { Button } from '../../components';
import { selectContacts } from '../../redux';

export const SettingsContacts = () => {
  const isDesktop = useMediaQuery();
  const contacts = useAccountsSelector(selectContacts);

  return (
    <div className="ext:h-[calc(100%-100px)] tablet:h-[100%]">
      <div className="w-[100%] px-[16px] py-[24px] border-b-[1px] border-solid border-dark_grey flex items-center justify-between">
        <p className={` ${isDesktop ? 'h2' : 'h1_ext'}`}>Contacts</p>
        {contacts.length ? (
          <Button
            mode="gradient"
            onClick={() => console.log('asd')}
            title="Add contact"
            className="w-[172px] ext:py-[7px] tablet:py-[7px]"
          />
        ) : (
          <></>
        )}
      </div>
      <div className="w-[100%] ext:h-[100%] tablet:h-[100%] flex"></div>
    </div>
  );
};
