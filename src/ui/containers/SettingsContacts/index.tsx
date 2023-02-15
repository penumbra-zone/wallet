import { useState } from 'react';
import { useAccountsSelector } from '../../../accounts';
import { Contact } from '../../../controllers';
import { useMediaQuery } from '../../../hooks';
import { getShortName } from '../../../utils';
import { Button, ContactsList, CreateContactForm } from '../../components';
import { selectContacts } from '../../redux';
import { DetailContactCard } from './DetailContactCard';

export const SettingsContacts = () => {
  const isDesktop = useMediaQuery();
  const contacts = useAccountsSelector(selectContacts);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  console.log({selectedContact});

  const [mode, setMode] = useState<'show' | 'create' | ''>('');

  const list = contacts.reduce((result, item: Contact) => {
    let letter = item.name[0].toUpperCase();
    if (!result[letter]) {
      result[letter] = [];
    }

    result[letter].push(item);
    return result;
  }, {});

  const handleSelect = (contact: Contact) => () => {
    setSelectedContact(contact);
    setMode('show');
  };

  const handleCreate = () => {
    setSelectedContact(null);
    setMode('create');
  };

  const handleCloseMode = () => {
    setMode('');
    setSelectedContact(null);
  };

  return (
    <div className="w-[100%] h-[100%]">
      <div className="w-[100%] px-[16px] h-[74px] border-b-[1px] border-solid border-dark_grey flex items-center justify-between">
        <div className={`flex items-center ${isDesktop ? 'h2' : 'h1_ext'}`}>
          <p
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleCloseMode}
          >
            Contacts
          </p>

          <p className="ml-[6px]">
            {selectedContact ? ' / ' + getShortName(selectedContact.name) : ''}
          </p>
        </div>
        {contacts.length && !selectedContact ? (
          <Button
            mode="gradient"
            onClick={handleCreate}
            title="Add contact"
            className="w-[172px] ext:py-[7px] tablet:py-[7px]"
          />
        ) : (
          <></>
        )}
      </div>
      <div className="w-[100%] h-[calc(100%-74px]] flex justify-between ">
        <div
          className={` ${
            mode
              ? !isDesktop
                ? 'w-[100%] h-[100%]'
                : 'w-[50%] tablet:border-r-[1px] tablet:border-solid tablet:border-dark_grey'
              : 'w-[100%]'
          }`}
        >
          {isDesktop ? (
            <ContactsList
              list={list}
              handleSelect={handleSelect}
              handleCreate={handleCreate}
            />
          ) : mode === 'create' ? (
            <CreateContactForm handleCancel={handleCloseMode} />
          ) : mode === 'show' ? (
            <DetailContactCard
              contact={selectedContact}
              setSelectedContact={setSelectedContact}
              handleCancel={handleCloseMode}
            />
          ) : (
            <ContactsList
              list={list}
              handleSelect={handleSelect}
              handleCreate={handleCreate}
            />
          )}
        </div>
        {mode && isDesktop && (
          <div className="w-[50%]">
            {mode === 'show' ? (
              <DetailContactCard
                contact={selectedContact}
                setSelectedContact={setSelectedContact}
                handleCancel={handleCloseMode}
              />
            ) : (
              <CreateContactForm handleCancel={handleCloseMode} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
