import { Octokit, RepoInformation, FileInformation } from './types';
import extractRepositoryContent, { dowloadFiles } from './extractRepositoryContent';

export default async function handleIssuesEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
): Promise<FileInformation[]> {
  const files = await extractRepositoryContent(octokit, repoInformation, podcastsDirectory);
  console.log('Files are:', files);

  // filter to get only yaml files and download their content
  const podcastFiles = files.filter((f) => f.name.endsWith('.yaml'));
  await dowloadFiles(podcastFiles);
  return files;
}
