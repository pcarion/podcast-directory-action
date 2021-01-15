import { Octokit, Reporter } from './types';

export default function mkReporter(octokit: Octokit, owner: string, repo: string, issueNumber: number): Reporter {
  const _lines: string[] = [];

  async function setLabel(label: string) {
    // https://octokit.github.io/rest.js/v18#issues-set-labels
    await octokit.issues.setLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [label],
    });
  }

  async function writeComment() {
    const body = _lines.join('\n');
    // https://octokit.github.io/rest.js/v18#issues-create-comment
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  }

  async function closeTicket() {
    await octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed',
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
      await writeComment();
      await closeTicket();
    },
    async fail(label: string): Promise<void> {
      if (label) {
        await setLabel(label);
      }
      await writeComment();
    },
  };
}
