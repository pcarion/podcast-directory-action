import { Octokit, RepoInformation, FileInformation } from './types';
import extractRepositoryContent, { dowloadFiles } from './extractRepositoryContent';
import validatePodcastYaml from './validatePodcastYaml';
import processUrl from './processUrl';

export interface HandleIssueResponse {
  candidateUrl: string;
  isSuccess: boolean;
  errorMessage?: string;
  podcastTitle?: string;
}

export default async function handleIssuesEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
  issueNumber: number,
  title: string,
): Promise<HandleIssueResponse> {
  const urlCandidate = title.trim();
  try {
    const result = await processUrl(urlCandidate, issueNumber);

    // used by commit acction
    // https://github.com/marketplace/actions/add-commit
    const message = `new podcast: ${result.title} (${result.rss})`;
    console.log(message);

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
    return {
      candidateUrl: urlCandidate,
      isSuccess: true,
      errorMessage: '',
      podcastTitle: result.title,
    };
  } catch (err) {
    return {
      candidateUrl: urlCandidate,
      isSuccess: false,
      errorMessage: err.message || err.toString(),
    };
  }
}
