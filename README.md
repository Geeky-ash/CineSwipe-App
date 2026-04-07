# 🎬 CineSwipe-App

A modern, interactive movie discovery web application built with React and Vite. Swipe through movies, discover new releases, and manage your watchlist with ease!

## 🌟 Features

- **Movie Discovery**: Browse and discover movies with detailed information
- **Interactive Swiping**: Swipe through movies with smooth animations
- **Watchlist Management**: Add/remove movies to your personal watchlist
- **User Authentication**: Secure user accounts via Supabase
- **Responsive Design**: Fully responsive UI that works on all devices
- **Real-time Updates**: Instant synchronization with Supabase backend
- **PWA Ready**: Progressive Web App support for mobile-like experience
- **Smooth Animations**: Beautiful transitions and interactions with Framer Motion

## 🚀 Live Demo

Visit the live application: [CineSwipe-App](https://cine-swipe-app.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.4 - UI library
- **Vite** 5.4.21 - Build tool with HMR
- **Tailwind CSS** 3.4.19 - Utility-first CSS
- **Framer Motion** 12.38.0 - Animation library
- **React Router** 7.13.2 - Client-side routing
- **Lucide React** 1.7.0 - Icon library
- **React Player** 3.4.0 - Video playback

### Backend
- **Supabase** - Backend-as-a-Service (Authentication, Database, Real-time)

### Build Tools
- **ESLint** - Code quality
- **PostCSS** - CSS processing
- **PWA Plugin** - Progressive Web App support

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Geeky-ash/CineSwipe-App.git
   cd CineSwipe-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 📂 Project Structure

```
CineSwipe-App/
├── src/                    # Source code
├── public/                 # Static assets
├── index.html             # Entry HTML file
├── package.json           # Project dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── eslint.config.js      # ESLint configuration
├── vercel.json           # Vercel deployment config
└── supabase_schema.sql   # Database schema
```

## 🗄️ Database Schema

The project includes a Supabase database schema (`supabase_schema.sql`) that sets up:
- User profiles
- Movie data tables
- Watchlist management
- Real-time subscriptions

## 🚀 Deployment

The application is deployed on **Vercel**. Any push to the main branch will trigger an automatic deployment.

### Manual Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

## 🔐 Authentication

User authentication is handled via Supabase Auth. The app supports:
- Email/password authentication
- Session management
- Secure token handling

## 🎨 Styling

The project uses **Tailwind CSS** for styling with a custom configuration. Refer to `tailwind.config.js` for customization options.

## 📱 PWA Support

The application includes PWA capabilities for offline support and app-like experience on mobile devices. Configure via `vite-plugin-pwa`.

## 🐛 Known Issues & Troubleshooting

- Ensure your Supabase credentials are correctly set in `.env.local`
- Clear browser cache if styles don't load properly
- Check console for Supabase connection errors

## 📄 License

This project is private and maintained by Geeky-ash.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📧 Contact

For questions or suggestions, please reach out via GitHub or the repository issues.

---

**Happy Swiping! 🎬✨**