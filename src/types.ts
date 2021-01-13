import { getOctokit } from '@actions/github';

export type Octokit = ReturnType<typeof getOctokit>;

export interface RepoInformation {
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string | null;
}
