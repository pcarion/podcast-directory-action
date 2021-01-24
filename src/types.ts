import { getOctokit } from '@actions/github';
import { Podcast } from './jtd/podcast';

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

export interface PodcastEnhanced extends Podcast {
  extra: {
    colors: {
      vibrant: string | null;
      darkVibrant: string | null;
      lightVibrant: string | null;
      muted: string | null;
      darkMuted: string | null;
      lightMuted: string | null;
    };
    episodes: {
      publishingDate: string;
    }[];
  };
}

export interface Reporter {
  info(i: string): void;
  error(i: string): void;

  succeed(label: string): Promise<void>;
  fail(label: string): Promise<void>;
}
