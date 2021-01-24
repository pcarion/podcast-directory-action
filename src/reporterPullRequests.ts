import { Octokit, Reporter } from './types';

export default function mkReporter(octokit: Octokit, owner: string, repo: string, pullRequestNumber: number): Reporter {
  const _lines: string[] = [];

  async function setLabel(label: string) {
    // same as issues
    await octokit.issues.setLabels({
      owner,
      repo,
      issue_number: pullRequestNumber,
      labels: [label],
    });
  }

  async function writeComment() {
    const body = _lines.join('\n');
    // same as issue comment
    https: await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullRequestNumber,
      body,
    });
  }

  async function mergePullRequest() {
    // update pull request if extra files were added to the branch
    await octokit.pulls.updateBranch({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });
    await octokit.pulls.update({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });
    // merging PR
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullRequestNumber,
      commit_title: `merge PR`,
      commit_message: `merge from PR #${pullRequestNumber}`,
      merge_method: 'squash',
    });
  }

  return {
    info(info: string) {
      _lines.push(info);
    },
    error(info: string) {
      _lines.push('');
      _lines.push(`**Error**: ${info}`);
    },
    async succeed(label: string): Promise<void> {
      if (label) {
        await setLabel(label);
      }
      // await writeComment();
      await mergePullRequest();
    },
    async fail(label: string): Promise<void> {
      if (label) {
        await setLabel(label);
      }
      await writeComment();
    },
  };
}
