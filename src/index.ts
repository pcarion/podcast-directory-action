import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { getRepositoryInformation } from './getRepositoryInformation';
import handleIssuesEvent from './handleIssuesEvent';

interface RepositoryOwner {
  owner: string;
  repo: string;
}

function getRepositoryOwner(): RepositoryOwner {
  const githubRepository = process.env['GITHUB_REPOSITORY'];
  if (!githubRepository) {
    throw new Error(`env not set:GITHUB_REPOSITORY`);
  }
  const parts = githubRepository.split('/');
  if (!parts || parts.length !== 2) {
    throw new Error(`invalid env :GITHUB_REPOSITORY=${githubRepository}`);
  }
  return {
    owner: parts[0].trim(),
    repo: parts[1].trim(),
  };
}

async function run() {
  try {
    const token = process.env['GH_PAT']; // || core.getInput('repo-token', { required: true });
    if (!token) {
      throw new Error('missing token: GH_PAT');
    }
    // console.log('@@ token:', token);
    // console.log('@@ token length:', token.length);
    // console.log('@@ token[>]:', token.substring(0, 5));
    // console.log('@@ token[<]:', token.substring(token.length - 4));
    const octokit = getOctokit(token);

    console.log('@@@ context:', context);

    const time = new Date().toTimeString();
    const podcastDirectory = 'podcasts'; // || core.getInput('podcast-yaml-directory');
    console.log(`podcastDirectory is ${podcastDirectory}!`);

    const repo = getRepositoryOwner();
    console.log('@@@ repo:', repo);

    const info = await getRepositoryInformation(octokit, repo.owner, repo.repo);
    console.log('@@@ info:', info);

    switch (context.eventName) {
      case 'issues':
        await handleIssuesEvent(octokit, info);
    }

    core.setOutput('title', time);
    core.setOutput('filename', podcastDirectory);
    core.setOutput('rss', time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
