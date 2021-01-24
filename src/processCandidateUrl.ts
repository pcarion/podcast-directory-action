import checkUrl from './checks/checkUrl';

import { Podcast, Feed } from './jtd/podcast';
import { emptyFeed } from './empty';
import { Reporter } from './types';

import processPodcastFeed from './processPodcastFeed';

interface CheckInputUrlResult {
  url: string;
  isValid: boolean;
  isItunesUrl: boolean;
}

function checkIfValidUrl(input: string): boolean {
  let url;

  try {
    url = new URL(input);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

async function checkInputUrl(input: string): Promise<CheckInputUrlResult> {
  const urlCandidate = input.trim();
  try {
    if (!checkIfValidUrl(urlCandidate)) {
      return {
        url: urlCandidate,
        isValid: false,
        isItunesUrl: false,
      };
    }
    const actualUrl = await checkUrl(urlCandidate);
    if (!actualUrl) {
      return {
        url: urlCandidate,
        isValid: false,
        isItunesUrl: false,
      };
    }
    const url = new URL(actualUrl);
    const hostname = url.hostname;
    let isItunesUrl = false;
    if (hostname.endsWith('apple.com')) {
      isItunesUrl = true;
    }
    return {
      url: actualUrl,
      isValid: true,
      isItunesUrl: isItunesUrl,
    };
  } catch (err) {
    return {
      url: urlCandidate,
      isValid: false,
      isItunesUrl: false,
    };
  }
}

interface ProcessUrlResult {
  podcast: Podcast;
  fileName: string;
  lines: string[];
}

export default async function processCandidateUrl(
  urlCandidate: string,
  issueNumber: number,
  reporter: Reporter,
): Promise<ProcessUrlResult> {
  try {
    reporter.info(`Processing podcast URL: ${urlCandidate}  (issue number: ${issueNumber})`);

    const info = await checkInputUrl(urlCandidate);
    if (!info.isValid) {
      reporter.error(`the podcast URL is not valid`);
      throw new Error(`invalid URL: ${urlCandidate}`);
    }
    let feed: Feed | undefined;
    if (info.isItunesUrl) {
      reporter.info('the url seems to be an itunes URL');
      feed = {
        ...emptyFeed,
        itunes: info.url,
      };
    } else {
      reporter.info('the url seems to be a RSS URL');
      feed = {
        ...emptyFeed,
        rss: info.url,
      };
    }
    if (feed) {
      const [podcast, fileName, lines] = await processPodcastFeed(feed, issueNumber);
      reporter.info('');
      reporter.info('podcast found at that URL:');
      reporter.info(`- title: \`${podcast.title}\``);
      reporter.info(`- description: \`${(podcast.description || '').substring(0, 100)}\`...`);
      return {
        podcast,
        fileName,
        lines,
      };
    } else {
      reporter.error('no podcast found at that URL');
      throw new Error(`no feed URL for ${info}`);
    }
  } catch (err) {
    reporter.error('error during processing of the podcast URL');
    console.log(`Error processing: url=${urlCandidate} issueNumber=${issueNumber}:`, err);
    throw err;
  }
}
