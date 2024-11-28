# Video Viewer

A modern, feature-rich video player application built with Next.js and shadcn/ui components. This application allows users to upload and play video files with captions, featuring an intuitive file explorer and advanced playback controls.

## Features

- **Advanced Video Playback**

  - Play/Pause with spacebar
  - Seek forward/backward with arrow keys
  - Volume control with up/down arrows
  - Mute/Unmute toggle with 'M' key
  - Caption support
  - Progress bar with seek functionality
  - Volume slider with visual feedback

- **File Management**

  - Directory upload support
  - Drag-and-drop functionality
  - File search and filtering
  - Collapsible file explorer
  - Support for multiple video formats

- **Modern UI/UX**
  - Dark theme optimized for video viewing
  - Responsive design
  - Keyboard shortcuts
  - Clean, intuitive interface
  - Real-time file search
  - Loading indicators

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Getting Started

1. Clone the repository:

```bash
git clone [your-repo-url]
cd videoviewer
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Usage

1. **Upload Videos**

   - Click the upload button or drag-and-drop files
   - Support for directory uploads
   - Accepts common video formats

2. **Video Controls**

   - Space: Play/Pause
   - Left/Right Arrow: Seek backward/forward
   - Up/Down Arrow: Adjust volume
   - M: Mute/Unmute
   - Click on progress bar to seek
   - Drag volume slider to adjust audio

3. **File Management**
   - Use the search bar to filter files
   - Click on files to play them
   - Collapse file explorer to maximize video view

## Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) and is optimized for modern web browsers. The codebase is written in TypeScript for better type safety and developer experience.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
