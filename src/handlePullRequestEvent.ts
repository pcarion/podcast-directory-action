import axios from 'axios';
import path from 'path';
import { Octokit, RepoInformation } from './types';
import { Podcast } from './jtd/podcast';
import addFilesToRepository from './gitutils/addFilesToRepository';
import mergePullRequest from './gitutils/mergePullRequest';
import enhancePodcast from './enhance/enhancePodcast';
import extractFilesFromPR from './extractFilesFromPR';
import validatePodcastYaml from './validatePodcastYaml';
import loadExistingPodcastFiles from './loadExistingPodcastFiles';
import checkPodcastModifications from './checks/checkPodcastModifications';
import mkReporter from './reporterPullRequests';

async function downloadFileContent(url: string): Promise<string> {
  const response = await axios({
    url: url,
    method: 'GET',
    responseType: 'text',
  });
  return response.data;
}

export interface HandlePullRequestResponse {
  isSuccess: boolean;
  errorMessage?: string;
  podcast?: Podcast;
  fileName?: string;
}

export default async function handlePullRequestEvent(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
  podcastJsonDirectory: string,
  prNumber: number,
  commitsUrl: string,
  pullRequestBranch: string,
): Promise<HandlePullRequestResponse> {
  const reporter = mkReporter(octokit, repoInformation.owner, repoInformation.repo, prNumber);

  try {
    const files = await extractFilesFromPR(octokit, commitsUrl);
    reporter.info(`Files modified in PR: * ${files.map((f) => f.filename).join('\n* ')}`);
    if (files.length !== 1) {
      throw new Error(`PR must change one and only one file from the podcasts directory`);
    }
    const file = files[0];

    // load existing podcasts
    const existingPodcasts = await loadExistingPodcastFiles(octokit, repoInformation, podcastsDirectory);

    // the file should be in the list of existing podcasts
    const originalPodcast = existingPodcasts.find((p) => p.yamlDescriptionFile === file.filename);
    if (!originalPodcast) {
      reporter.error(`file in PR is not an existing podcast file: ${file.filename}`);
      throw new Error(`a PR should only change an existing podcast file: ${file.filename}`);
    }
    // check that the file is a valid podcast description file
    const content = await downloadFileContent(file.url);
    const podcast = validatePodcastYaml(content, file.filename);

    const podcastEnhanced = await enhancePodcast(podcast, path.basename(file.filename));

    // we check if the change are OK
    await checkPodcastModifications(originalPodcast, podcast);

    const addToRepository = await addFilesToRepository(octokit, repoInformation);
    await addToRepository.addJsonFile(`${podcastJsonDirectory}/${podcastEnhanced.pid}.json`, podcastEnhanced);

    const sha = await addToRepository.commit(
      `adding podcast: ${podcastEnhanced.title} - ${podcastEnhanced.yamlDescriptionFile}`,
      pullRequestBranch,
    );

    await mergePullRequest(octokit, repoInformation.owner, repoInformation.repo, prNumber, sha);

    await reporter.succeed('PR ok');
    return {
      isSuccess: true,
      fileName: file.filename,
      podcast: podcast,
    };
  } catch (err) {
    reporter.error(`processing error: ${err.message || err.toString()}`);
    reporter.info('');
    reporter.info('feel free to update your PR is you can fix that error');
    reporter.info('someone will review that error shortly in case this is an internal error');
    reporter.info('');
    reporter.info('Thank you for your submission!');

    await reporter.fail('error processing PR');
    return {
      isSuccess: false,
      errorMessage: err.message || err.toString(),
    };
  }
}
