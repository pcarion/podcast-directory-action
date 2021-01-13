import { Octokit, RepoInformation, FileInformation } from './types';
import extractRepositoryContent from './extractRepositoryContent';

export default async function handleIssuesEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
): Promise<FileInformation[]> {
  const files = await extractRepositoryContent(octokit, repoInformation);
  console.log('Files are:', files);
  return files;
}
