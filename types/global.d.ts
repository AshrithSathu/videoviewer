declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare namespace JSX {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

interface HTMLInputElement extends HTMLElement {
  webkitdirectory: boolean;
  directory: boolean;
}
