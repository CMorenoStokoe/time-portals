import path from 'node:path'

// Contains relevant filepaths for operations
export const databaseDir = path.join(process.cwd(), '..', 'database')
export const getOutDir = (agent: string, runName: string) =>
	path.join(databaseDir, 'agents', agent, 'outputs', runName)
export const getInputDir = (agent: string, runName: string) =>
	path.join(databaseDir, 'agents', agent, 'inputs', runName)
