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
    },
    async fail(label: string): Promise<void> {
      if (label) {
        await setLabel(label);
      }
      await writeComment();
    },
  };
}
