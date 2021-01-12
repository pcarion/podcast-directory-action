import { Octokit } from './types';

interface RepoInformation {
  defaultBranch: string;
  description: string | null;
}
export async function getRepositoryInformation(octo: Octokit, owner: string, repo: string): Promise<RepoInformation> {
  try {
    const result = await octo.repos.get({
      owner,
      repo,
    });
    if (!result || !result.data) {
      throw new Error('no repo information');
    }
    const r = result.data;
    return {
      defaultBranch: r.default_branch,
      description: r.description,
    };
  } catch (err) {
    console.log('>getRepositoryInformation>', err);
    throw err;
  }
}
