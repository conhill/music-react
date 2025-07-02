# 🎵 Is it a Banger? - AI Music Classifier

A modern React web application that uses artificial intelligence to determine if your music tracks are "bangers" or not. Built with React, Vite, and the Web Audio API, this app processes audio files and sends them to an AI model for classification.

![Demo Screenshot](https://via.placeholder.com/800x400/FF6B35/FFFFFF?text=Is+it+a+Banger%3F)

## ✨ Features

- **🎧 Audio Upload**: Drag & drop or click to upload audio files
- **🤖 AI Classification**: Powered by machine learning to classify music as "bangers"
- **🎚️ Audio Processing**: Automatically extracts 10-second samples and converts to required format
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🎨 Animated Interface**: Smooth animations and gradient backgrounds
- **📊 Confidence Scoring**: Get percentage confidence scores with predictions

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/is-it-a-banger.git
   cd is-it-a-banger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🎯 How It Works

1. **Upload Audio**: Users can drag & drop or select audio files (MP3, WAV, FLAC, AAC, OGG)
2. **Audio Processing**: The app extracts the middle 10 seconds of the track
3. **Format Conversion**: Audio is converted to mono 22050Hz WAV format
4. **AI Analysis**: Processed audio is sent to the Flask API for classification
5. **Results Display**: Users receive a "banger" or "not banger" classification with confidence score

## 🏗️ Technical Architecture

### Frontend Technologies
- **React 19.1.0** - Modern React with hooks
- **Vite 6.3.5** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Lucide React** - Beautiful icons
- **Web Audio API** - Audio processing in the browser

### Audio Processing Pipeline
```
Audio File → ArrayBuffer → AudioContext → 10s Extract → Mono Conversion → WAV Format → API Upload
```

### Project Structure
```
src/
├── main.jsx           # Main React component and app entry
public/
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── README.md          # This file
```

## 🎵 Supported Audio Formats

- **MP3** - Most common format
- **WAV** - Uncompressed audio
- **FLAC** - Lossless compression
- **AAC** - Advanced Audio Coding
- **OGG** - Open source format

## 🌐 API Integration

The application connects to a Flask API backend:
- **Endpoint**: `https://music-flask-api.onrender.com/predict`
- **Method**: POST
- **Format**: FormData with WAV file
- **Response**: JSON with prediction and confidence score

### Example API Response
```json
{
  "prediction": "bangers",
  "score": 0.85
}
```

## 🎨 UI/UX Features

- **Gradient Backgrounds**: Eye-catching amber to red gradients
- **Animated Elements**: Floating particles and wave animations
- **Drag & Drop Interface**: Intuitive file upload experience
- **Loading States**: Clear feedback during processing
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🔧 Configuration

### Vite Configuration
The project uses a minimal Vite config with React plugin:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

### Environment Variables
No environment variables required for basic functionality. The API endpoint is hardcoded but can be moved to environment variables if needed.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow React hooks best practices
- Keep components small and focused
- Use Tailwind classes for styling

## 🐛 Known Issues

- Large audio files (>50MB) may take longer to process
- Some browsers may have Web Audio API limitations
- API may have rate limiting on the free tier

## 📈 Future Enhancements

- [ ] Multiple file upload support
- [ ] Audio visualization during processing
- [ ] User accounts and history
- [ ] Genre-specific classification
- [ ] Mobile app version
- [ ] Real-time audio recording

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Flask API for AI model hosting
- Lucide React for beautiful icons
- Tailwind CSS for rapid styling
- Web Audio API for client-side processing

## 📞 Support

If you have any questions or issues:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Made with ❤️ and 🎵 by [Your Name]**

*Drop your tracks and let AI decide if they're bangers!* 🔥
