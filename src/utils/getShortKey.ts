export const getShortKey = (text: string) => {
	if (!text) return ''
	return text.slice(0, 36) + '...'
}

export const getShortName = (text: string, amount = 14) => {
	if (!text) return
	if (text.length <= amount) return text
	return text.slice(0, amount) + '...'
}
