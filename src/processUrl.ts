import checkUrl from './checkUrl';

import { Podcast, Feed } from './jtd/podcast';
import { emptyFeed } from './empty';

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

export default async function processUrl(urlCandidate: string, issueNumber: number): Promise<ProcessUrlResult> {
  try {
    const info = await checkInputUrl(urlCandidate);
    if (!info.isValid) {
      throw new Error(`invalid URL: ${urlCandidate}`);
    }
    let feed: Feed | undefined;
    if (info.isItunesUrl) {
      feed = {
        ...emptyFeed,
        itunes: info.url,
      };
    } else {
      feed = {
        ...emptyFeed,
        rss: info.url,
      };
    }
    if (feed) {
      const [podcast, fileName, lines] = await processPodcastFeed(feed, issueNumber);
      return {
        podcast,
        fileName,
        lines,
      };
    } else {
      throw new Error(`no feed URL for ${info}`);
    }
  } catch (err) {
    console.log(`Error processing: url=${urlCandidate} issueNumber=${issueNumber}:`, err);
    throw err;
  }
}
