export interface File {
  name: string;
  content: string;
  language: 'origami' | 'json' | 'markdown';
  isEntry?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: Record<string, File>; // path -> File
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string; // simple markdown/html string for demo
}

export interface CodeSnippet {
  code: string;
  output: string;
}

export enum ThemeColor {
  Cyan = 'cyan',
  Magenta = 'magenta',
  Blue = 'blue'
}