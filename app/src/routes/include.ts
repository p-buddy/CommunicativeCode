export async function get(request) {
  const includeFileLocation = "include.txt";
  const rootDir = "base/";

  const includeFiles: string[] = await fetch(includeFileLocation, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
    .then((r) => r.text())
    .then(s => s.split(/\r?\n/))
    .then(files => files.filter(file => file.trim() !== ""));

  const getContent = async (location: string): Promise<string> => {
    return await fetch(location, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/javascript'
      }
    }).then((r) => r.text());
  }

  const relativePaths: string[] = includeFiles.map(path => path.replace(rootDir, ""));
  const contents: string[] = await Promise.all(includeFiles.map(path => getContent(path)));

  const body = relativePaths.reduce((obj, key, index) => ({ ...obj, [key]: contents[index] }), {});

  return {
    body,
  }
}