const RESET = '\x1b[0m'
const greyColor = '\x1b[38;5;245m'
const uniqueColor = (node: string) => {
	const first = (node.trim()[0] ?? 'A').toUpperCase()
	const codePoint = first.codePointAt(0) ?? 65
	const palette = [
		33, 39, 45, 51, 69, 75, 81, 87, 93, 99, 105, 111, 117, 123, 129, 135,
		141, 147, 153, 159, 165, 171, 177, 183, 189, 195,
	]
	const color = palette[codePoint % palette.length]
	return `\x1b[38;5;${color}m(${node})${RESET}`
}

export class GraphViewCLI {
	public edges: [string, string][]
	public currentNode: number = -1
	public currentSpinnerFrame: number = 0
	private spinnerInterval: NodeJS.Timeout | null = null

	constructor(edges: Set<[string, string]>) {
		this.edges = [...edges]
		process.stdout.write('\n\n')
		this.update('Getting started...')
		this.spinnerInterval = setInterval(this.generateNextSpinnerFrame, 250)
	}
	generateNextSpinnerFrame() {
		this.currentSpinnerFrame = (this.currentSpinnerFrame + 1) % 4
		const spinnerFrames = ['|', '/', '—', '\\']
		process.stdout.moveCursor(0, -2)
		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)
		process.stdout.write(spinnerFrames[this.currentSpinnerFrame])
		process.stdout.moveCursor(0, 2)
	}
	update(status: string) {
		console.log('Updating graph view with status:', status)
		this.currentNode++
		process.stdout.moveCursor(0, -1)
		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)
		process.stdout.write(
			this.edges
				.map(([, to], i) =>
					i === this.currentNode ? uniqueColor(to) : to,
				)
				.join(' -> '),
		)
		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)
		process.stdout.write(`${greyColor}${status.slice(0, 100)}${RESET}`)
		process.stdout.moveCursor(0, 1)
	}

	stop() {
		if (this.spinnerInterval) {
			clearInterval(this.spinnerInterval)
			this.spinnerInterval = null
			process.stdout.moveCursor(0, -2)
			process.stdout.clearLine(0)
			process.stdout.cursorTo(0)
		}
	}
}
