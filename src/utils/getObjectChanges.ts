export const getObjectChanges = (
	obj1: Record<string, number>,
	obj2: Record<string, number>
): Record<string, number> => {
	const changes: Record<string, number> = {}

	for (const key in obj2) {
		if (obj1[key] !== obj2[key]) {
			changes[key] = obj2[key]
		}
	}

	return changes
}