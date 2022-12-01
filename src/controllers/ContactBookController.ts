import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';

export type Contact = {
  name: string;
  address: string;
  note?: string;
};

export class ContactBookController {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        contacts: [
          {
            name: 'vadim',
            address: 'asdasd',
          },
        ],
      })
    );
    extensionStorage.subscribe(this.store);
  }

  setContact(contact: Contact) {
    const { contacts } = this.store.getState();
    this.store.updateState([...contacts, contact]);
  }

  updateContact(address: Record<string, string>) {
    // const { addresses } = this.store.getState();
    // this.store.updateState({ addresses: { ...newAddresses, ...addresses } });
  }

  removeContact(address: string) {
    const { contacts } = this.store.getState();
    const filteredContact = contacts.filter((i) => i.address !== address);
    this.store.updateState(filteredContact);
  }
}
