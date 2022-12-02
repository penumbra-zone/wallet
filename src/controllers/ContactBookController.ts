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
            address:
              'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957rw',
          },
          {
            name: 'vadim 1',
            address:
              'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r8',
          },
          {
            name: 'dariya 1',
            address:
              'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r0',
          },
          {
            name: 'dariya 2',
            address:
              'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r1',
          },
          {
            name: 'segiy 2',
            address:
              'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9k',
          },
          {
            name: 'ihor 2',
            address:
              'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957rc',
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
