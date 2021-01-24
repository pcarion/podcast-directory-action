import { Podcast, Feed } from '../jtd/podcast';

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

export default async function checkForDuplicatePodcast(podcasts: Podcast[], podcastToCheck: Podcast): Promise<void> {
  for (const podcast of podcasts) {
    if (checkIfDuplicatePodcast(podcast.feed, podcastToCheck.feed)) {
      console.log('Podcast already added:', podcast);
      throw new Error(`podcast already added in file: \`${podcast.yamlDescriptionFile}\``);
    }
  }
}
