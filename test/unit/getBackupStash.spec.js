import { execGit } from '../../lib/execGit.js'
import { GitWorkflow, STASH } from '../../lib/gitWorkflow.js'
import { getInitialState } from '../../lib/state.js'
import { GetBackupStashError } from '../../lib/symbols'

jest.mock('../../lib/execGit.js', () => ({
  execGit: jest.fn(async () => ''),
}))

describe('gitWorkflow', () => {
  const options = { gitConfigDir: '.' }

  describe('getBackupStash', () => {
    it('should throw when stash not found', async () => {
      const gitWorkflow = new GitWorkflow(options)
      const ctx = getInitialState()

      await expect(gitWorkflow.getBackupStash(ctx)).rejects.toThrowError(
        'lint-staged automatic backup is missing!'
      )

      expect(ctx.errors.has(GetBackupStashError)).toEqual(true)
    })

    it('should throw when stash not found even when other stashes are', async () => {
      const gitWorkflow = new GitWorkflow(options)
      const ctx = getInitialState()

      execGit.mockResolvedValueOnce('stash@{0}: some random stuff')

      await expect(gitWorkflow.getBackupStash(ctx)).rejects.toThrowError(
        'lint-staged automatic backup is missing!'
      )

      expect(ctx.errors.has(GetBackupStashError)).toEqual(true)
    })

    it('should return ref to the backup stash', async () => {
      const gitWorkflow = new GitWorkflow(options)
      const ctx = getInitialState()

      execGit.mockResolvedValueOnce(
        [
          'stash@{0}: some random stuff',
          `stash@{1}: ${STASH}`,
          'stash@{2}: other random stuff',
        ].join('\n')
      )

      await expect(gitWorkflow.getBackupStash(ctx)).resolves.toEqual('1')
    })
  })
})
