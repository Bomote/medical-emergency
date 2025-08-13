# Emergency Medicine Reference

A comprehensive digital emergency medicine reference tool designed for healthcare professionals. This web application provides quick access to critical clinical information for emergency conditions, with advanced clinical decision support tools, dosage calculators, and offline capabilities.

## Features

### 🏥 Comprehensive Medical Reference
- **150+ Emergency Conditions**: Organized from most common to least common
- **Specialty Color Coding**: Visual organization by medical specialty
- **ICD-10 Codes**: International classification codes for each condition
- **Age Group Support**: Adult, pediatric, and combined protocols

### 🧮 Dosage Calculator & Clinical Tools
- **Weight-Based Calculations**: Convert mg/kg doses to actual doses based on patient weight
- **BMI & BSA Calculators**: Body Mass Index and Body Surface Area calculations
- **Unit Conversions**: Convert mg to mL based on drug concentrations
- **Clinical Decision Support**: Built-in scoring systems (CURB-65, qSOFA, GCS, Wells Score, NIHSS)
- **Risk Stratification**: Evidence-based risk assessment tools
- **Drug Allergy Warnings**: Alternative medication suggestions for common allergies

### ⭐ Quick Access & Favorites
- **Bookmark System**: Save frequently used conditions with localStorage persistence
- **Recent Searches**: Track and quickly access your last 10 searches
- **Most Critical Panel**: Quick access to the top 10 life-threatening conditions
- **Smart Navigation**: Direct scroll-to functionality for rapid access

### 🔍 Advanced Search & Filtering
- **Multi-field Search**: Search across conditions, symptoms, treatments, ICD codes, and personal notes
- **Specialty Filtering**: Filter by medical specialty (Internal Medicine, Surgery, Pediatrics, etc.)
- **Severity Level Filtering**: Filter by condition priority and urgency
- **Age Group Filtering**: Filter by adult, pediatric, or combined protocols
- **Search Autocomplete**: Intelligent suggestions with medical terminology
- **Related Conditions**: Discover related conditions based on specialty and keywords

### 📝 Personal Note-Taking & Data Management
- **Condition-Specific Notes**: Add personal observations and reminders for each condition
- **Auto-Save**: Notes are automatically saved to local storage
- **Searchable Notes**: Your notes are included in search results
- **Export/Import**: Backup and restore notes, favorites, and search history
- **Print-Friendly**: Optimized layouts for offline reference cards

### 📱 Offline & PWA Capabilities
- **Progressive Web App**: Install on mobile devices and desktops
- **Service Worker**: Cache critical medical data for offline access
- **Offline Indicator**: Visual feedback for connection status
- **Mobile Optimized**: Works seamlessly on smartphones, tablets, and desktops

### ⚡ Performance Optimization
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Lazy Loading**: Load condition details only when needed
- **Search Result Caching**: Avoid re-filtering on repeated searches
- **Memoized Components**: Optimized rendering performance

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd emergency-reference
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
emergency-reference/
├── app/
│   ├── page.tsx              # Main application component
│   ├── layout.tsx            # Root layout with PWA configuration
│   ├── globals.css           # Global styles and Tailwind configuration
│   └── loading.tsx           # Loading component
├── components/
│   ├── DosageCalculator.tsx  # Weight-based dosage calculations
│   ├── ClinicalDecisionSupport.tsx # Clinical scoring systems
│   ├── QuickAccessPanel.tsx  # Critical conditions quick access
│   ├── RecentSearches.tsx    # Search history management
│   ├── FavoritesManager.tsx  # Bookmarking functionality
│   ├── AdvancedSearchFilters.tsx # Advanced filtering options
│   ├── SearchAutocomplete.tsx # Intelligent search suggestions
│   ├── RelatedConditions.tsx # Related condition recommendations
│   ├── DataManager.tsx       # Export/import functionality
│   ├── VirtualizedConditionList.tsx # Performance-optimized list
│   ├── OfflineIndicator.tsx  # Connection status indicator
│   └── ui/                   # Reusable UI components (shadcn/ui)
├── public/
│   ├── emergencyConditions.json # Medical conditions database
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker for offline functionality
│   └── *.png                 # App icons and assets
├── lib/
│   └── utils.ts              # Utility functions
└── README.md
\`\`\`

## Data Structure

Each emergency condition follows this comprehensive structure:

\`\`\`typescript
interface EmergencyCondition {
  id: number                    // Unique identifier
  orderRank: number            // Priority ranking (1 = most common)
  condition: string            // Condition name
  icd10Code: string           // ICD-10 classification code
  abbrev: string              // Common abbreviation
  specialty: string           // Medical specialty
  subSpecialty: string        // Sub-specialty (if applicable)
  ageGroup: "Adult" | "Pediatric" | "Both"
  presentation: string        // Clinical presentation
  investigations: string     // Diagnostic tests
  redFlags: string[]         // Warning signs requiring immediate action
  differentials: string[]    // Differential diagnoses
  adultTreatment: Treatment  // Adult treatment protocol
  pedsTreatment: Treatment   // Pediatric treatment protocol
  procedure: string          // Key procedures
  references: Reference[]    // Medical textbook references
  whoGuideline: string      // WHO guideline reference
  lastUpdated: string       // Last update date
  keywords: string[]        // Search keywords
}

interface Treatment {
  drugName: string           // Primary medication
  drugClass: string         // Pharmacological class
  dose: string              // Standard dose
  doseMgPerKg: string       // Pediatric dose per kg
  maxDose: string           // Maximum dose limit
  route: string             // Administration route
  frequency: string         // Dosing frequency
  duration: string          // Treatment duration
  notes: string             // Clinical notes
}
\`\`\`

## Usage Guide

### Clinical Decision Support Tools
1. **Access Tools**: Click the "Clinical Tools" button on any condition card
2. **Scoring Systems**: Use built-in calculators for CURB-65, qSOFA, GCS, and other clinical scores
3. **Risk Assessment**: Get evidence-based risk stratification and recommendations
4. **Drug Allergies**: Check for contraindications and alternative medications

### Dosage Calculator
1. **Open Calculator**: Click the "Calculator" button on any condition card
2. **Enter Patient Data**: Input weight, height, and age for accurate calculations
3. **Drug Concentrations**: Specify medication concentrations for volume calculations
4. **Get Results**: View calculated doses, BMI, BSA, and administration volumes

### Quick Access & Favorites
1. **Bookmark Conditions**: Click the star icon to add conditions to favorites
2. **Access Recent Searches**: Use the dropdown to revisit previous searches
3. **Critical Conditions**: Use the "Most Critical" panel for life-threatening emergencies
4. **Smart Navigation**: Click condition names for direct scroll-to functionality

### Advanced Search & Filtering
1. **Search Autocomplete**: Start typing for intelligent medical term suggestions
2. **Multiple Filters**: Combine specialty, severity, and age group filters
3. **Related Conditions**: Discover related conditions in the sidebar
4. **Search History**: Access your recent searches for quick reference

### Data Management
1. **Export Data**: Use the Data Manager to backup notes, favorites, and search history
2. **Import Data**: Restore previously exported data across devices
3. **Print Reference**: Generate print-friendly condition cards for offline use
4. **Data Statistics**: View usage statistics and data insights

## Technical Details

### Built With
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Window**: Virtual scrolling for performance
- **Lucide React**: Icon library
- **shadcn/ui**: Component library

### PWA Features
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Native app-like experience
- **Installable**: Add to home screen on mobile devices
- **Offline Indicator**: Real-time connection status

### Performance Optimizations
- **Virtual Scrolling**: Handle large datasets efficiently
- **Lazy Loading**: Load content on demand
- **Memoization**: Prevent unnecessary re-renders
- **Search Caching**: Cache search results for faster access

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on multiple devices
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Medical Content Guidelines
- **Accuracy**: All medical information must be evidence-based
- **Sources**: Include proper textbook and guideline references
- **Review**: Medical content should be reviewed by qualified professionals
- **Updates**: Keep treatment protocols current with latest guidelines

### Code Standards
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Create modular components for easier maintenance
- Include proper error handling
- Write descriptive commit messages

## License

This project is intended for educational and clinical reference purposes. Please ensure compliance with local medical practice regulations and guidelines.

## Support

For technical issues or feature requests, please open an issue in the repository.

## Disclaimer

This tool is designed to assist healthcare professionals and should not replace clinical judgment or established medical protocols. Always follow your institution's guidelines and consult with senior colleagues when in doubt.
