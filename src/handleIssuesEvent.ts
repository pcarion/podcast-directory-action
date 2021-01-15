import { Podcast, Feed } from './jtd/podcast';
import { Octokit, RepoInformation } from './types';
import extractRepositoryContent, { dowloadFiles } from './extractRepositoryContent';
import validatePodcastYaml from './validatePodcastYaml';
import processUrl from './processUrl';
import addFileToRepository from './addFileToRepository';
import mkReporter from './reporter';

export interface HandleIssueResponse {
  candidateUrl: string;
  isSuccess: boolean;
  errorMessage?: string;
  podcast?: Podcast;
  fileName?: string;
}

function checkIfDuplicatePodcast(feed1: Feed, feed2: Feed): boolean {
  function cmpUrl(url1: string, url2: string): boolean {
    if (url1.trim() === '_') {
      return false;
    }
    if (url2.trim() === '_') {
      return false;
    }
    return url1.trim().toLowerCase() === url2.trim().toLowerCase();
  }

  if (cmpUrl(feed1.rss, feed2.rss)) {
    return true;
  }
  if (cmpUrl(feed1.itunes, feed2.itunes)) {
    return true;
  }
  if (cmpUrl(feed1.spotify, feed2.spotify)) {
    return true;
  }
  if (cmpUrl(feed1.google, feed2.google)) {
    return true;
  }
  return false;
}

export default async function handleIssuesEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
  issueNumber: number,
  title: string,
): Promise<HandleIssueResponse> {
  const urlCandidate = title.trim();
  const reporter = mkReporter(octokit, repoInformation.owner, repoInformation.repo, issueNumber);

  try {
    // process the URL to get associated podcast
    const result = await processUrl(urlCandidate, issueNumber, reporter);
    console.log(result.podcast);

    // before we can add this podcast, we need to check that this is not a duplicate
    const files = await extractRepositoryContent(octokit, repoInformation, podcastsDirectory);

    // filter to get only yaml files and download their content
    const podcastFiles = files.filter((f) => f.name.endsWith('.yaml'));
    await dowloadFiles(podcastFiles);

    console.log('podcast files are:', files);

    for (const file of podcastFiles) {
      if (!file.content) {
        throw new Error(`missing content for file: ${file.name}`);
      }
      const podcast = validatePodcastYaml(file.content, file.name);
      console.log(file.name);
      console.log(podcast);
      if (checkIfDuplicatePodcast(podcast.feed, result.podcast.feed)) {
        console.log('Podcast already added:', podcast);
        throw new Error(`podcast already added in file: \`${file.path}\``);
      }
    }

    await addFileToRepository(octokit, repoInformation, result.fileName, result.lines, result.podcast.title);

    reporter.info('');
    reporter.info(`Your submission was successfully added in: \`${result.fileName}\``);
    reporter.info('The site will be regenerated automatically shortly and your submission will appear soon there');
    reporter.info('');
    reporter.info('Thank you for your submission!');

    await reporter.succeed('new podcast');
    return {
      candidateUrl: urlCandidate,
      isSuccess: true,
      errorMessage: '',
      podcast: result.podcast,
      fileName: result.fileName,
    };
  } catch (err) {
    reporter.error(`processing error: ${err.message || err.toString()}`);
    reporter.info('');
    reporter.info('if you see an error in the URL, you can update the title of the ticket with the proper URL');
    reporter.info('someone will review that error shortly in case this is an nternal error');
    reporter.info('');
    reporter.info('Thank you for your submission!');

    await reporter.fail('error adding podcast');
    return {
      candidateUrl: urlCandidate,
      isSuccess: false,
      errorMessage: err.message || err.toString(),
    };
  }
}
