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

    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);

    switch (context.eventName) {
      case 'issues':
        if (!context.payload.issue) {
          core.setFailed('no issue payload');
          break;
        }

        const issueNumber = context.payload.issue.number;
        if (!issueNumber) {
          core.setFailed('no issueNumber for the issue');
          break;
        }
        const title = context.payload.issue.title as string;
        if (!title) {
          core.setFailed('no title for the issue');
          break;
        }

        const result = await handleIssuesEvent(octokit, info, podcastDirectory, issueNumber, title);
        console.log('Result:');
        console.log(result);
        if (!result.isSuccess) {
          core.setFailed(result.errorMessage || 'internal error');
          break;
        }
        if (!result.podcast) {
          core.setFailed('internal error -- missing podcast information');
          break;
        }
        core.setOutput('title', result.podcast.title);
        core.setOutput('filename', result.fileName);
    }

    core.setOutput('title', time);
    core.setOutput('filename', podcastDirectory);
    core.setOutput('rss', time);
    // Get the JSON webhook payload for the event that triggered the workflow
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
