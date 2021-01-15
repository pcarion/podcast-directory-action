import { getOctokit } from '@actions/github';

export type Octokit = ReturnType<typeof getOctokit>;

export interface RepoInformation {
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string | null;
}

export interface FileInformation {
  name: string;
  path: string;
  destPath: string;
  download_url: string;
  content?: string;
}

export interface Reporter {
  info(i: string): void;
  error(i: string): void;

  succeed(label: string): Promise<void>;
  fail(label: string): Promise<void>;
}
