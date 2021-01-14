import { Octokit, RepoInformation, FileInformation } from './types';
import extractRepositoryContent, { dowloadFiles } from './extractRepositoryContent';
import validatePodcastYaml from './validatePodcastYaml';

export default async function handleIssuesEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
): Promise<FileInformation[]> {
  const files = await extractRepositoryContent(octokit, repoInformation, podcastsDirectory);

  // filter to get only yaml files and download their content
  const podcastFiles = files.filter((f) => f.name.endsWith('.yaml'));
  await dowloadFiles(podcastFiles);

  console.log('Files are:', files);

  for (const file of podcastFiles) {
    if (!file.content) {
      throw new Error(`missing content for file: ${file.name}`);
    }
    const podcast = validatePodcastYaml(file.content);
    console.log(file.name);
    console.log(podcast);
  }
  return podcastFiles;
}
