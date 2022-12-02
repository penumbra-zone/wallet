import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';

export type Contact = {
  name: string;
  address: string;
  note?: string;
};

export class ContactBookController {
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        contacts: [],
      })
    );
    extensionStorage.subscribe(this.store);
  }

  setContact(contact: Contact) {
    const { contacts } = this.store.getState();

    this.store.updateState({ contacts: [...contacts, contact] });
  }

  updateContact(contact: Contact, prevAddress: string) {
    const { contacts } = this.store.getState();
    const index = contacts.findIndex((c: Contact) => c.address === prevAddress);
    contacts[index] = contact;

    this.store.updateState({ contacts });
  }

  removeContact(address: string) {
    const { contacts } = this.store.getState();
    const filteredContact = contacts.filter((i) => i.address !== address);
    this.store.updateState({ contacts: filteredContact });
  }
}
