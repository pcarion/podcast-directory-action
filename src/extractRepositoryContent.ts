import { Octokit, RepoInformation, FileInformation } from './types';
import axios from 'axios';

async function downloadFile(file: FileInformation): Promise<void> {
  console.log('download file', { file });

  const response = await axios({
    url: file.download_url,
    method: 'GET',
    responseType: 'text',
  });
  file.content = response.data;
}

async function dowloadFiles(listOfFiles: FileInformation[]) {
  for (const file of listOfFiles) {
    await downloadFile(file);
  }
}

async function extractFilesFromRepositoryContent(
  octo: Octokit,
  listOfFiles: FileInformation[],
  info: RepoInformation,
  path: string,
  rootPath: string,
): Promise<void> {
  console.log('@@ extractFilesFromRepositoryContent', {
    info: info,
    path: path,
  });
  const content = await octo.repos.getContent({
    owner: info.owner,
    repo: info.repo,
    path: path,
    ref: info.defaultBranch,
  });
  if (!content.data || !Array.isArray(content.data)) {
    throw new Error(`no data available at ${info.owner}'${info.repo}/${path}/${info.defaultBranch}`);
  }
  const templateFiles = content.data;
  for (const file of templateFiles) {
    if (file.type === 'file') {
      listOfFiles.push({
        name: file.name,
        path: file.path,
        destPath: file.path.slice(rootPath.length > 0 ? rootPath.length + 1 : 0),
        download_url: file.download_url || '_',
      });
    } else if (file.type === 'dir') {
      await extractFilesFromRepositoryContent(octo, listOfFiles, info, file.path, rootPath);
    } else {
      console.log('unknown file type', { file });
    }
  }
}

export default async function extractRepositoryContent(
  octo: Octokit,
  info: RepoInformation,
): Promise<FileInformation[]> {
  console.log('Extracting repository content', { info });
  const listOfFiles: FileInformation[] = [];

  await extractFilesFromRepositoryContent(octo, listOfFiles, info, '', '');
  // await dowloadFiles(listOfFiles);

  console.log('>extractRepositoryContent>Done');
  return listOfFiles;
}
