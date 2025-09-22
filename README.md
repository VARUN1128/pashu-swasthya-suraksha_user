# Pashu Swasthya Suraksha - Farm Animal Health & Antimicrobial Stewardship

A comprehensive, production-ready frontend web application for tracking antimicrobial usage, ensuring food safety, and maintaining compliance with regulatory standards for livestock and poultry farming.

## 🚀 Features

### Core Functionality
- **Animal Management**: Register and manage livestock with detailed information
- **AMU Logging**: Track antimicrobial usage with automatic withdrawal period calculations
- **Compliance Monitoring**: Built-in MRL (Maximum Residue Limit) database for regulatory compliance
- **Multi-Role Support**: Designed for farmers, veterinarians, and regulators
- **Real-time Alerts**: Critical withdrawal period and compliance notifications
- **Analytics & Reporting**: Comprehensive dashboards and export capabilities

### Technical Features
- **Mobile-First Design**: Optimized for farm environments
- **Offline Support**: Local storage for offline data entry
- **Multi-Language Ready**: English, Hindi, and Malayalam support structure
- **Responsive UI**: Works seamlessly across all devices
- **Form Validation**: Client-side validation with real-time feedback
- **Data Export**: CSV and PDF export capabilities

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Forms**: react-hook-form with Zod validation
- **Charts**: Recharts for analytics
- **Icons**: Lucide React
- **Storage**: LocalForage for offline caching
- **Export**: PapaParse for CSV generation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd pashu-swasthya-suraksha

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── animals/           # Animal management
│   ├── entry/             # AMU entry forms
│   ├── entries/           # AMU entries listing
│   ├── reports/           # Export and reporting
│   ├── settings/          # User settings
│   └── help/              # Help and support
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── animals/           # Animal-related components
│   ├── amu/               # AMU entry components
│   ├── dashboard/         # Dashboard components
│   └── layout/            # Layout components
├── contexts/              # React Context providers
├── data/                  # Mock data and seed files
├── lib/                   # Utility functions and services
│   ├── mockClient.ts      # Mock API client
│   └── validation.ts      # Validation engine
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Pashu Swasthya Suraksha"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# API Configuration (for future Supabase integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🎯 User Roles & Permissions

### Farmer
- Add and manage animals
- Log AMU entries
- View withdrawal periods and alerts
- Export farm data

### Veterinarian
- Review and approve AMU entries
- Access vet dashboard
- Prescribe treatments
- View assigned animals

### Auditor/Regulator
- View analytics and compliance reports
- Export regulatory data
- Monitor farm compliance
- Access audit trails

### Admin
- Manage MRL database
- Configure system settings
- User management
- System analytics

## 📊 Data Models

### Core Entities
- **User**: Authentication and role management
- **Farm**: Farm location and details
- **Animal**: Livestock information
- **AMUEntry**: Antimicrobial usage records
- **MRLRule**: Maximum residue limit rules
- **Alert**: System notifications
- **AuditLog**: Change tracking

### Key Relationships
- User → Farm (one-to-many)
- Farm → Animal (one-to-many)
- Animal → AMUEntry (one-to-many)
- AMUEntry → MRLRule (many-to-one)

## 🔄 API Integration

### Current Implementation
The application currently uses a mock API client (`src/lib/mockClient.ts`) that simulates backend calls with realistic delays and data.

### Supabase Integration
To integrate with Supabase, replace the mock client with real API calls:

#### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

#### 2. Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### 3. Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'vet', 'auditor', 'admin')),
  farm_id UUID REFERENCES farms(id),
  contact TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location JSONB NOT NULL, -- {lat, lng, address}
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals table
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  weight DECIMAL,
  farm_id UUID REFERENCES farms(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AMU Entries table
CREATE TABLE amu_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animals(id),
  user_id UUID REFERENCES users(id),
  drug_name TEXT NOT NULL,
  drug_class TEXT NOT NULL,
  dose_mg DECIMAL NOT NULL,
  route TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  withdrawal_period_days INTEGER NOT NULL,
  calculated_safe_date DATE NOT NULL,
  notes TEXT,
  prescription_image_url TEXT,
  vet_approved BOOLEAN DEFAULT false,
  vet_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MRL Rules table
CREATE TABLE mrl_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  species TEXT NOT NULL,
  tissue TEXT NOT NULL,
  max_residue_limit DECIMAL NOT NULL,
  withdrawal_days_default INTEGER NOT NULL,
  min_dose DECIMAL,
  max_dose DECIMAL,
  contraindications TEXT[]
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  animal_id UUID REFERENCES animals(id),
  amu_entry_id UUID REFERENCES amu_entries(id),
  farm_id UUID REFERENCES farms(id),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  changes JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE amu_entries ENABLE ROW LEVEL SECURITY;

-- Farmers can only see their own farm data
CREATE POLICY "Farmers can view own farm data" ON farms
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Farmers can view own animals" ON animals
  FOR ALL USING (farm_id IN (
    SELECT id FROM farms WHERE owner_id = auth.uid()
  ));

-- Vets can see all data
CREATE POLICY "Vets can view all data" ON farms
  FOR ALL USING (true);

-- Auditors can view all data
CREATE POLICY "Auditors can view all data" ON farms
  FOR ALL USING (true);
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### AWS S3 + CloudFront
1. Build the application: `npm run build`
2. Upload `out/` directory to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## 📱 Mobile App Integration

The application is built with mobile-first principles and can be easily converted to a React Native app or PWA:

### PWA Setup
1. Add service worker for offline functionality
2. Configure manifest.json for app installation
3. Implement push notifications for alerts

### React Native
1. Use React Native Web for code sharing
2. Implement native features like camera for prescription photos
3. Add offline sync capabilities

## 🌐 Internationalization

The application is structured for easy i18n implementation:

### Adding New Languages
1. Create language files in `src/locales/`
2. Update the language selector in settings
3. Add RTL support for Arabic if needed

### Example Language File
```typescript
// src/locales/hi.json
{
  "common": {
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "delete": "हटाएं"
  },
  "animals": {
    "addAnimal": "नया पशु जोड़ें",
    "species": "प्रजाति",
    "breed": "नस्ल"
  }
}
```

## 🔒 Security Considerations

### Data Protection
- All sensitive data is encrypted in transit
- Local storage is used for offline data only
- User authentication is required for all operations

### Compliance
- GDPR compliant data handling
- Audit trail for all data changes
- Secure file upload for prescription images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [User Manual](./docs/user-manual.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

### Contact
- Email: support@pashuswasthya.com
- Phone: +91-9876543210
- Website: https://pashuswasthya.com

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core AMU logging functionality
- ✅ Basic analytics and reporting
- ✅ Mobile-responsive design

### Phase 2 (Next 3 months)
- 🔄 Supabase integration
- 🔄 Real-time notifications
- 🔄 Advanced analytics
- 🔄 Mobile app (PWA)

### Phase 3 (Next 6 months)
- 📋 Blockchain integration for audit trails
- 📋 AI-powered compliance recommendations
- 📋 Integration with veterinary systems
- 📋 Multi-tenant architecture

## 🙏 Acknowledgments

- Indian Council of Agricultural Research (ICAR)
- Food Safety and Standards Authority of India (FSSAI)
- Veterinary professionals and farmers who provided feedback
- Open source community for excellent tools and libraries

---

**Built with ❤️ for the farming community in India**