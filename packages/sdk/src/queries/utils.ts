export async function limitConcurrency<T, R>(
	tasks: T[],
	handler: (task: T) => Promise<R>,
	limit: number
): Promise<R[]> {
	const results: R[] = []
	const taskQueue: T[] = [...tasks]

	const executeTask = async () => {
		if (taskQueue.length === 0) return

		const task = taskQueue.pop()
		if (task !== undefined) {
			const result = await handler(task)
			results.push(result)
		}

		await executeTask()
	}

	const initialPromises = Array.from({ length: limit }).map(() => executeTask())
	await Promise.all(initialPromises)

	return results
}
