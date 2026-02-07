# TruckFlow Frontend

Modern, mobile-first logistics management platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Dual Role System**: Separate interfaces for Managers and Drivers
- **Real-time Updates**: WebSocket notifications using Socket.IO
- **Multi-language Support**: English and Greek with easy language switching
- **Responsive Design**: Mobile-first, works on all devices
- **Load Management**: Create, assign, track, and complete loads
- **Document Upload**: POD images, invoices, and documents via Cloudinary
- **Dashboard Analytics**: Real-time statistics and metrics
- **Authentication**: Secure JWT-based authentication with refresh tokens

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **Backend API**: TruckFlow backend must be running

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd truck-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 4. Cloudinary Setup

1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com) and sign up
2. **Get Cloud Name**: 
   - Go to [Console](https://console.cloudinary.com/)
   - Copy your "Cloud name"
3. **Create Upload Preset**:
   - Go to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Set **Signing Mode** to "Unsigned"
   - Set **Folder** to "truck-flow" (optional)
   - Under "Upload manipulations" → "Allowed formats": Add `jpg,png,gif,webp,pdf`
   - Save and note the preset name
4. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Application will start on `http://localhost:3000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

## 👥 User Roles & Features

### Manager Features
- ✅ Create and manage loads
- ✅ Assign loads to drivers
- ✅ View all loads (pending, accepted, completed, rejected)
- ✅ Create and manage driver accounts
- ✅ View dashboard with analytics
- ✅ Track revenue and cashflow
- ✅ Receive real-time notifications
- ✅ View uploaded documents and PODs

### Driver Features
- ✅ View assigned loads
- ✅ Accept or decline loads
- ✅ Upload proof of delivery (POD)
- ✅ Upload invoices and documents
- ✅ View load details and timeline
- ✅ Track earnings
- ✅ Receive real-time notifications
- ✅ View load history

## 📁 Project Structure

```
truck-flow/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── load/              # Load management pages
│   │   ├── settings/          # Settings pages
│   │   ├── drivers/           # Driver management
│   │   └── ...
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   ├── shared/            # Shared components
│   │   └── ui/                # UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── LoadContext.tsx    # Load management state
│   │   ├── NotificationContext.tsx
│   │   └── LanguageContext.tsx
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   ├── socket.ts          # WebSocket client
│   │   └── cloudinary.ts      # Cloudinary utilities
│   ├── i18n/
│   │   └── config.ts          # i18n configuration
│   ├── messages/
│   │   ├── en.json            # English translations
│   │   └── el.json            # Greek translations
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── providers/
│       └── TranslationProvider.tsx
├── public/                     # Static assets
├── .env.example               # Environment template
├── .env.local                 # Your environment (gitignored)
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## 🔐 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | Yes | `http://localhost:5000` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | `your-cloud-name` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | Yes | `truck-flow` |

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Context API
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form (where applicable)
- **HTTP Client**: Fetch API
- **File Upload**: Cloudinary
- **Internationalization**: next-intl

## 🌍 Multi-language Support

The app supports English and Greek. To add a new language:

1. Add language to `src/i18n/config.ts`:
```typescript
export const locales = ['en', 'el', 'de'] as const; // Add 'de' for German
export const localeNames: Record<Locale, string> = {
  en: 'English',
  el: 'Ελληνικά',
  de: 'Deutsch', // Add German
};
```

2. Create translation file `src/messages/de.json`
3. Copy structure from `en.json` and translate

## 🧪 Testing

### Manual Testing

1. **Start Backend**: Make sure backend is running on port 5000
2. **Start Frontend**: `npm run dev`
3. **Login as Manager**:
   - Email: `manager@truckflow.com`
   - Password: `manager123`
4. **Create Driver**: Go to "Add Driver" and create a driver account
5. **Test Features**: Create loads, assign to driver, etc.

## 🐛 Troubleshooting

### API Connection Error
```
Failed to fetch
```
**Solution**: 
- Check backend is running on `http://localhost:5000`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### WebSocket Not Connecting
```
WebSocket connection failed
```
**Solution**:
- Check `NEXT_PUBLIC_SOCKET_URL` matches backend URL
- Ensure backend Socket.IO is configured correctly

### Cloudinary Upload Fails
```
Failed to upload image to Cloudinary
```
**Solution**:
- Verify cloud name and upload preset are correct
- Check upload preset is set to "Unsigned"
- For PDFs, ensure preset allows "raw" file type

### Translation Keys Showing
```
UI shows "tabs.dispute" instead of "Dispute"
```
**Solution**:
- Check translation key exists in `messages/en.json` and `messages/el.json`
- Clear browser cache and reload

### Build Errors
```
Type error: Property 'x' does not exist
```
**Solution**:
- Check TypeScript types in `src/types/index.ts`
- Run `npm run build` to see all errors

## 📱 Mobile Support

The app is mobile-first and fully responsive:
- ✅ Touch-friendly interface
- ✅ Optimized for small screens
- ✅ PWA-ready (manifest.json included)
- ✅ Works offline (with service worker)

## 🔄 Updates & Deployment

### Development
```bash
git pull
npm install
npm run dev
```

### Production
```bash
git pull
npm install
npm run build
npm start
```

### Deployment Platforms
- **Vercel**: Recommended (zero-config)
- **Netlify**: Supported
- **Docker**: Dockerfile can be added
- **Traditional Server**: Use `npm start` after build

## 📝 Notes

- **Authentication**: Tokens stored in localStorage
- **Language**: Preference stored in localStorage
- **Real-time**: WebSocket reconnects automatically
- **File Upload**: Direct to Cloudinary (no backend storage)
- **Images**: Optimized with Next.js Image component

## 🔒 Security

- JWT tokens with refresh mechanism
- HTTPS recommended for production
- Environment variables for sensitive data
- CORS configured on backend
- XSS protection via React
- CSRF protection via SameSite cookies

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review console for errors
- Check Network tab for API calls
- Verify environment variables

## 📄 License

[Your License Here]
