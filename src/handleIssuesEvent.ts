import { Podcast } from './jtd/podcast';
import { Octokit, RepoInformation } from './types';
import processCandidateUrl from './processCandidateUrl';
import addFileToRepository from './addFileToRepository';
import loadExistingPodcastFiles from './loadExistingPodcastFiles';
import checkForDuplicatePodcast from './checkForDuplicatePodcast';
import mkReporter from './reporterIssues';

export interface HandleIssueResponse {
  candidateUrl: string;
  isSuccess: boolean;
  errorMessage?: string;
  podcast?: Podcast;
  fileName?: string;
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
    const result = await processCandidateUrl(urlCandidate, issueNumber, reporter);
    console.log(result.podcast);

    // load existing podcasts
    const podcasts = await loadExistingPodcastFiles(octokit, repoInformation, podcastsDirectory);

    // before we can add this podcast, we need to check that this is not a duplicate
    await checkForDuplicatePodcast(podcasts, result.podcast);

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
    reporter.info('someone will review that error shortly in case this is an internal error');
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
