import ObservableStore from 'obs-store'
import { ExtensionStorage } from '../storage'

export type Contact = {
	name: string
	address: string
}

export class ContactBookController {
	store

	constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({
				contacts: [],
			})
		)
		extensionStorage.subscribe(this.store)
	}

	setContact(contact: Contact) {
		const { contacts } = this.store.getState()

		if (contacts.find(i => i.name === contact.name))
			throw new Error('Contact with this name exist')
		if (contacts.find(i => i.address === contact.address))
			throw new Error('Contact with this address exist')

		this.store.updateState({ contacts: [...contacts, contact] })
	}

	updateContact(contact: Contact, prevAddress: string) {
		const { contacts } = this.store.getState()
		const filteredContacts = contacts.filter(i => i.address !== prevAddress)

		if (filteredContacts.find(i => i.name === contact.name))
			throw new Error('Contact with this name exist')
		if (filteredContacts.find(i => i.address === contact.address))
			throw new Error('Contact with this address exist')

		const index = contacts.findIndex((c: Contact) => c.address === prevAddress)
		contacts[index] = contact

		this.store.updateState({ contacts })
	}

	removeContact(address: string) {
		const { contacts } = this.store.getState()
		const filteredContact = contacts.filter(i => i.address !== address)
		this.store.updateState({ contacts: filteredContact })
	}
}
