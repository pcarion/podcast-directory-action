import yaml from 'js-yaml';
import { validate as validateAgainsJtdSchema } from 'jtd';
import schema from './jtd/podcast/schema';
import { Podcast } from './jtd/podcast';

function loadYamlFile(content: string): unknown {
  const doc = yaml.load(content);
  if (!doc) {
    throw new Error(`error loading yaml content: ${content}`);
  }
  return doc;
}

function validateJdtSchema(content: unknown): Podcast {
  const validationErrors = validateAgainsJtdSchema(schema, content);

  if (validationErrors.length !== 0) {
    console.log(validationErrors);
    throw new Error(
      `content is not valid - ${content} - (schema validation): ${JSON.stringify(validationErrors, null, '  ')}`,
    );
  }
  return content as Podcast;
}

export default function validatePodcastYaml(content: string, fileName: string): Podcast {
  try {
    const doc = loadYamlFile(content);
    const podcast = validateJdtSchema(doc);
    podcast.yamlDescriptionFile = fileName;
    return podcast;
  } catch (err) {
    console.log(err);
    throw new Error(`invalid podcast yaml structure for: ${fileName}`);
  }
}
