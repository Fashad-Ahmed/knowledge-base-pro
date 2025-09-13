# NeuralVault - Privacy First Personal Knowledge Management

A production-grade, privacy-first, self-hosted personal knowledge management system built with modern web technologies. Store, organize, search, and manage your notes with AI-powered features while maintaining full control over your data.

![Knowledge Management System](https://img.shields.io/badge/Built_with-React_+_TypeScript-blue) ![Supabase](https://img.shields.io/badge/Backend-Supabase-green) ![Docker](https://img.shields.io/badge/Deployment-Docker-blue) ![Privacy First](https://img.shields.io/badge/Privacy-First-red)

## ✨ Features

### Core Functionality
- **📝 Rich Note Editor**: Create and edit notes with markdown support
- **📁 Folder Organization**: Hierarchical folder structure for better organization
- **🏷️ Tagging System**: Tag-based categorization with smart suggestions
- **🔍 Full-Text Search**: Powerful search across all your content
- **⭐ Favorites & Archive**: Mark important notes and archive old ones
- **📊 Analytics Dashboard**: Track your knowledge creation patterns

### AI-Powered Features
- **🤖 AI Assistant**: Chat with an AI that knows your knowledge base
- **✨ Content Enhancement**: AI-powered content improvement
- **📋 Auto-Summarization**: Generate summaries of long notes
- **🏷️ Smart Tagging**: AI-suggested tags based on content
- **💡 Title Generation**: AI-generated titles for your notes

### Privacy & Security
- **🔒 Row-Level Security (RLS)**: Database-level security policies
- **👤 User Authentication**: Secure user accounts with Supabase Auth
- **🔐 Self-Hosted**: Full control over your data
- **🌐 Open Source**: Completely open source and auditable

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/knowledgebase.git
   cd knowledgebase
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access your application**
   - Frontend: http://localhost:3000
   - Supabase Studio (if local): http://localhost:3001

### Option 2: Supabase Cloud + Docker Frontend

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Environment**
   ```bash
   # .env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Deploy Database Schema**
   - Use the provided SQL migrations in `supabase/migrations/`
   - Or run: `supabase db push` (if you have Supabase CLI)

4. **Build and Deploy**
   ```bash
   docker build -t knowledgebase .
   docker run -p 3000:80 knowledgebase
   ```

### Option 3: Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Initialize Supabase (optional for local development)
   supabase init
   supabase start
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for blazing-fast development and building
- **Tailwind CSS** with custom design system
- **shadcn/ui** components for consistent UI
- **React Router** for client-side navigation

### Backend Stack
- **Supabase** for backend infrastructure
- **PostgreSQL** with Row-Level Security (RLS)
- **Edge Functions** (TypeScript/Deno) for API logic
- **OpenAI Integration** for AI features
- **Full-text search** with PostgreSQL's built-in capabilities

### Database Schema

The system uses a comprehensive database schema with the following key entities:

- **profiles**: User profile information
- **notes**: Core note storage with content, tags, and metadata
- **folders**: Hierarchical folder structure for organization
- **tags**: Reusable tag system with colors
- **note_tags**: Many-to-many relationship between notes and tags
- **search_history**: Search analytics and history

### API Endpoints

The backend provides RESTful APIs through Supabase Edge Functions:

#### Notes API (`/functions/v1/notes-api`)
- `GET /` - List all notes with filters
- `GET /{id}` - Get single note
- `POST /` - Create new note
- `PUT /{id}` - Update note
- `DELETE /{id}` - Delete note

#### Search API (`/functions/v1/search-api`)
- `POST /` - Full-text search with filters

#### Folders API (`/functions/v1/folders-api`)
- `GET /` - List folders with hierarchy
- `POST /` - Create folder
- `PUT /{id}` - Update folder
- `DELETE /{id}` - Delete folder

#### Tags API (`/functions/v1/tags-api`)
- `GET /` - List all tags with usage stats
- `POST /` - Create tag
- `PUT /{id}` - Update tag
- `DELETE /{id}` - Delete tag

#### AI Assistant API (`/functions/v1/ai-assistant`)
- `POST /` - AI operations (summarize, enhance, chat, etc.)

## 🔧 Configuration

### Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Optional: Custom Domain
CUSTOM_DOMAIN=your-domain.com
```

### Supabase Configuration

1. **Database Setup**: Run the provided migrations
2. **Authentication**: Enable email/password auth
3. **RLS Policies**: Applied automatically via migrations
4. **Edge Functions**: Deployed automatically

### AI Features Setup

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add it to your Supabase secrets or environment variables
3. AI features will be automatically available

## 🔒 Security & Privacy

### Data Privacy
- **Self-Hosted**: Your data never leaves your infrastructure
- **Open Source**: Full transparency of all code
- **No Tracking**: No analytics or tracking scripts
- **Local Storage**: All data stored in your chosen database

### Security Features
- **Row-Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure user sessions
- **API Key Management**: Secure handling of third-party APIs
- **HTTPS/SSL Ready**: TLS encryption for data in transit

### Compliance
- **GDPR Ready**: Full data portability and deletion
- **SOC 2 Type II**: If using Supabase Cloud
- **Privacy by Design**: Built with privacy as a core principle

## 📊 Performance

### Frontend Performance
- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Optimized images and fonts
- **Caching Strategy**: Aggressive caching for static assets
- **Bundle Size**: < 500KB initial bundle

### Backend Performance
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Edge Functions**: Global distribution via Supabase
- **Full-Text Search**: Native PostgreSQL search capabilities

## 🚢 Deployment Options

### Production Deployment

#### Docker + Reverse Proxy
```bash
# docker-compose.prod.yml
version: '3.8'
services:
  knowledgebase:
    build: .
    environment:
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kb.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.kb.tls=true"
      - "traefik.http.routers.kb.tls.certresolver=letsencrypt"
```

#### Cloud Platforms
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Static hosting with serverless functions
- **AWS/GCP/Azure**: Container services or static hosting
- **DigitalOcean**: App Platform or Droplets

### Self-Hosted Supabase

For complete self-hosting:

```bash
# Clone Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Configure
cp .env.example .env
# Edit .env with your settings

# Start Supabase
docker-compose up -d
```

## 🛠️ Development

### Project Structure
```
knowledgebase/
├── src/
│   ├── components/           # React components
│   ├── pages/               # Route components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   └── integrations/        # API integrations
├── supabase/
│   ├── functions/           # Edge functions
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase config
├── public/                  # Static assets
└── docker/                  # Docker configurations
```

### Development Workflow
1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Build: `npm run build`
5. Deploy to staging
6. Create pull request

## 📖 API Documentation

### Authentication
All API endpoints require authentication via JWT tokens:
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### Example API Usage
```javascript
// Create a note
const response = await supabase.functions.invoke('notes-api', {
  body: {
    title: 'My Note',
    content: 'Note content here...',
    tags: ['important', 'work']
  }
})

// Search notes
const searchResults = await supabase.functions.invoke('search-api', {
  body: {
    query: 'important information',
    filters: { folder_id: 'folder-uuid' }
  }
})

// AI Enhancement
const enhanced = await supabase.functions.invoke('ai-assistant', {
  body: {
    action: 'enhance',
    content: 'Basic note content'
  }
})
```

## 🔍 Troubleshooting

### Common Issues

#### Authentication Issues
```bash
# Check Supabase configuration
supabase status

# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Database Connection
```sql
-- Test database connection
SELECT current_database(), current_user;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notes';
```

#### AI Features Not Working
1. Verify OpenAI API key in Supabase secrets
2. Check Edge Function logs
3. Ensure sufficient OpenAI credits

### Performance Issues
- Enable database connection pooling
- Optimize database queries with EXPLAIN ANALYZE
- Use CDN for static assets
- Enable gzip compression

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

For support with this Lovable project:
- 📧 Edit directly in [Lovable](https://lovable.dev/projects/187ba9fc-26e5-4c2c-84d2-eccdb9ab9a6b)
- 📖 Documentation: [Lovable Docs](https://docs.lovable.dev)
- 🐛 Bug Reports: Use the Lovable chat interface

## 🗺️ Roadmap

### v1.1 (Next Release)
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Plugin system
- [ ] Advanced AI features

### v1.2 (Future)
- [ ] End-to-end encryption
- [ ] Blockchain integration
- [ ] Advanced analytics
- [ ] Multi-language support

---

**Built with ❤️ for privacy-conscious knowledge workers using Lovable**
