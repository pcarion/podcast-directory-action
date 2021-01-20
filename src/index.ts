import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { getRepositoryInformation } from './getRepositoryInformation';
import handleIssuesEvent from './handleIssuesEvent';
import handlePullRequestEvent from './handlePullRequestEvent';

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
    console.log('Starting github action...');
    const token = core.getInput('repo-token');
    console.log(`repo-token: ${token.substring(0.3)}...`);
    const podcastDirectory = core.getInput('podcast-yaml-directory');
    console.log(`podcastDirectory: ${podcastDirectory}`);
    const octokit = getOctokit(token);

    const time = new Date().toTimeString();

    const repo = getRepositoryOwner();

    const info = await getRepositoryInformation(octokit, repo.owner, repo.repo);

    // const payload = JSON.stringify(context, undefined, 2);
    // console.log(`>> The context is: ${payload}`);
    // console.log('====');
    switch (context.eventName) {
      case 'issues': {
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
        break;
      }
      case 'pull_request': {
        console.log('@@@ pull_request');
        if (!context.payload.pull_request) {
          core.setFailed('no pull_request payload');
          break;
        }
        const prNumber = context.payload.number;
        if (!prNumber) {
          core.setFailed('no number for the issue');
          break;
        }
        console.log('@@@ PR number:', prNumber);
        const commitsUrl = context.payload.pull_request?.commits_url;
        if (!commitsUrl) {
          core.setFailed('no commitsUrl');
          break;
        }
        const result = await handlePullRequestEvent(octokit, info, podcastDirectory, prNumber, commitsUrl as string);
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
        break;
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
