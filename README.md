# Docker Analysis Platform

A modern web application that analyzes Dockerfiles, estimates package sizes from requirements.txt files, and measures internet speed to provide accurate download time estimates. Built with React, TypeScript, Tailwind CSS, and powered by Google's Gemini AI.

## ✨ Features

- **Dockerfile Analysis**: Upload and analyze Dockerfiles to understand each instruction's impact
- **Requirements Analysis**: Estimate package sizes and total download requirements
- **Speed Testing**: Real-time internet speed measurement
- **Time Estimation**: Calculate download times based on file sizes and connection speed
- **Dark/Light Theme**: Beautiful theme switching with system preference detection
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **AI-Powered**: Uses Google Gemini API for intelligent analysis

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd docker-analysis-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: Google Generative AI (Gemini)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Deployment**: Ready for Netlify, Vercel, or any static hosting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ThemeToggle.tsx # Dark/light theme switcher
├── hooks/              # Custom React hooks
│   └── useTheme.ts     # Theme management hook
├── services/           # API and external services
│   └── geminiService.ts # Gemini AI integration
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## 🎨 Design Features

- **Premium Color System**: Custom color palette with primary, secondary, and accent colors
- **Smooth Animations**: Fade-in effects and micro-interactions
- **Responsive Layout**: Mobile-first design with breakpoints
- **Dark Mode**: System preference detection with manual toggle
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Configuration

### Environment Variables

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key (required)

### Customization

The application uses a custom Tailwind CSS configuration with:
- Extended color palette (primary, secondary, accent)
- Custom animations and keyframes
- Dark mode support
- Responsive breakpoints

## 📦 Deployment

### Netlify (Recommended)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Vercel

1. Connect your repository to Vercel
2. Set `VITE_GEMINI_API_KEY` in environment variables
3. Deploy automatically on push

### Manual Deployment

1. Run `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Ensure environment variables are configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent analysis capabilities
- Tailwind CSS for the utility-first styling approach
- Lucide React for beautiful icons
- React team for the amazing framework