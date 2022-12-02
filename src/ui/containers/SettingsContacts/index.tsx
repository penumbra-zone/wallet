import { useState } from 'react';
import { useAccountsSelector } from '../../../accounts';
import { Contact } from '../../../controllers';
import { useMediaQuery } from '../../../hooks';
import { Button, ContactsList, CopySvg } from '../../components';
import { selectContacts } from '../../redux';
import toast from 'react-hot-toast';

type DetailContactCardProps = {
  contact: Contact;
};

const DetailContactCard: React.FC<DetailContactCardProps> = ({ contact }) => {
  const isDesktop = useMediaQuery();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contact.address);
    toast.success('Success copied!', {
      position: 'top-right',
    });
  };

  return (
    <div className="py-[24px] w-[100%] flex flex-col px-[16px]">
      <div className="ext:w-[40px] ext:h-[40px] tablet:w-[52px] tablet:h-[52px] li_gradient rounded-[50%] flex items-center justify-center mb-[16px]">
        <div className="ext:w-[39px] ext:h-[39px] tablet:w-[51px] tablet:h-[51px] bg-brown rounded-[50%] flex items-center justify-center"></div>
      </div>
      <p className={`mb-[24px] ${isDesktop ? 'h3' : 'h2_ext'}`}>
        {contact.name}
      </p>
      <Button
        title="Edit"
        mode="gradient"
        onClick={() => console.log('asd')}
        className="tablet:w-[100%] mb-[24px]"
      />
      <div className="flex flex-col mb-[24px]">
        <p className="text_body mb-[16px]">Penumbra's address</p>
        <div className="flex items-center py-[8px] ext:px-[16px] tablet:px-[10px] bg-dark_grey rounded-[15px]">
          <p className="break-all text_body mr-[10px]">{contact.address}</p>
          <span
            className=" cursor-pointer svg_hover"
            onClick={copyToClipboard}
            role="button"
            tabIndex={0}
          >
            <CopySvg width="20" height="20" fill="#524B4B" />
          </span>
        </div>
      </div>
      {contact.note && (
        <div className="flex flex-col mb-[24px]">
          <p className="text_body mb-[16px]">Note</p>
          <div className="flex items-center py-[8px] ext:px-[16px] tablet:px-[10px] bg-dark_grey rounded-[15px]">
            <p className="break-all text_body">{contact.note}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsContacts = () => {
  const isDesktop = useMediaQuery();
  const contacts = useAccountsSelector(selectContacts);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const list = contacts.reduce((result, item: Contact) => {
    let letter = item.name[0].toUpperCase();
    if (!result[letter]) {
      result[letter] = [];
    }

    result[letter].push(item);
    return result;
  }, {});

  const handleSelect = (contact: Contact) => () => setSelectedContact(contact);

  return (
    <div className="">
      <div className="w-[100%] px-[16px] py-[24px] border-b-[1px] border-solid border-dark_grey flex items-center justify-between">
        <div className={`flex items-center ${isDesktop ? 'h2' : 'h1_ext'}`}>
          <p
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleSelect(null)}
          >
            Contacts
          </p>

          <p className="ml-[6px]">
            {selectedContact ? ' / ' + selectedContact.name : ''}
          </p>
        </div>
        {contacts.length && !selectedContact ? (
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
      {isDesktop ? (
        <>
          <div className="w-[100%] ext:h-[100%] tablet:h-[100%] flex justify-between items-stretch">
            <div
              className={`${selectedContact ? 'w-[60%]' : 'w-[100%]'} ${
                selectedContact
                  ? 'tablet:border-r-[1px] tablet:border-solid tablet:border-dark_grey'
                  : ''
              }`}
            >
              <ContactsList list={list} handleSelect={handleSelect} />
            </div>
            {selectedContact && (
              <div className="w-[40%] h-[100%]">
                <DetailContactCard contact={selectedContact} />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {!selectedContact ? (
            <ContactsList list={list} handleSelect={handleSelect} />
          ) : (
            <DetailContactCard contact={selectedContact} />
          )}
        </>
      )}
    </div>
  );
};
