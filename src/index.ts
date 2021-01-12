import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';

async function run() {
  try {
    const token = core.getInput('repo-token', { required: true });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const octokit = getOctokit(token);

    const time = new Date().toTimeString();
    const podcastDirectory = core.getInput('podcast-yaml-directory');
    console.log(`podcastDirectory is ${podcastDirectory}!`);
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
