import { wordlists } from 'bip39'

export const getWordListOprions = () => {
	const words = wordlists.EN

	return words.map(i => ({
		value: i,
		label: i,
	}))
}
