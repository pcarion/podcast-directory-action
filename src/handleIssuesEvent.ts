import { Octokit, RepoInformation, FileInformation } from './types';
import extractRepositoryContent from './extractRepositoryContent';

export default async function handleIssuesEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
): Promise<FileInformation[]> {
  const files = await extractRepositoryContent(octokit, repoInformation, podcastsDirectory);
  console.log('Files are:', files);
  return files;
}
