// FileTextIcon Component
export const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// Enhanced language detection
export const getLanguageFromExtension = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    xml: 'xml',
    py: 'python',
    php: 'php',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'shell',
    bash: 'shell',
    yml: 'yaml',
    yaml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    conf: 'ini',
    md: 'markdown',
    markdown: 'markdown',
    tex: 'latex',
    sql: 'sql',
    txt: 'plaintext',
    log: 'plaintext',
  };

  return languageMap[extension] || 'plaintext';
};

// Default content templates
export const getDefaultContent = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const templates = {
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
    css: '/* Add your styles here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
    js: '// JavaScript code\nconsole.log("Hello World!");',
    py: '# Python code\nprint("Hello World!")',
    php: '<?php\n// PHP code\necho "Hello World!";\n?>',
    md: '# Markdown Document\n\nWrite your content here...',
    json: '{\n    "name": "example",\n    "version": "1.0.0"\n}',
  };

  return templates[extension] || '';
};
