# Emergency Medicine Reference

A comprehensive digital emergency medicine reference tool designed for healthcare professionals. This web application provides quick access to critical clinical information for emergency conditions, with searchable content, specialty filtering, and personal note-taking capabilities.

## Features

### 🏥 Comprehensive Medical Reference
- **150+ Emergency Conditions**: Organized from most common to least common
- **Specialty Color Coding**: Visual organization by medical specialty
- **ICD-10 Codes**: International classification codes for each condition
- **Age Group Support**: Adult, pediatric, and combined protocols

### 🔍 Advanced Search & Filtering
- **Multi-field Search**: Search across conditions, symptoms, treatments, ICD codes, and personal notes
- **Specialty Filtering**: Filter by medical specialty (Internal Medicine, Surgery, Pediatrics, etc.)
- **Real-time Results**: Instant filtering as you type

### 📝 Personal Note-Taking
- **Condition-Specific Notes**: Add personal observations and reminders for each condition
- **Auto-Save**: Notes are automatically saved to local storage
- **Searchable Notes**: Your notes are included in search results
- **Visual Indicators**: See which conditions have notes at a glance

### 📱 Responsive Design
- **Mobile Optimized**: Works seamlessly on smartphones, tablets, and desktops
- **Touch Friendly**: Optimized for touch interactions
- **Offline Capable**: Core functionality works without internet connection

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
│   ├── layout.tsx            # Root layout with fonts and providers
│   ├── globals.css           # Global styles and Tailwind configuration
│   └── loading.tsx           # Loading component
├── data/
│   └── emergencyConditions.json  # Medical conditions database
├── components/
│   └── ui/                   # Reusable UI components (shadcn/ui)
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

### Basic Navigation
1. **Search**: Use the search bar to find conditions by name, symptoms, treatments, or ICD codes
2. **Filter**: Select a medical specialty to narrow results
3. **Browse**: Scroll through conditions organized by clinical priority

### Adding Notes
1. Click the "Notes" button on any condition card
2. Type your personal observations or reminders
3. Notes are automatically saved and remain available across sessions
4. Search your notes using the main search bar

### Clinical Information Layout
Each condition displays:
- **Header**: Condition name, ICD-10 code, specialty, age group
- **Clinical Presentation**: Signs and symptoms
- **Investigations**: Recommended diagnostic tests
- **Red Flags**: Critical warning signs (highlighted in red)
- **Differentials**: Alternative diagnoses to consider
- **Treatment Protocols**: Separate adult and pediatric sections
- **References**: Medical textbook citations
- **WHO Guidelines**: International treatment standards

## Customization

### Adding New Conditions
1. Edit `data/emergencyConditions.json`
2. Follow the existing data structure
3. Ensure all required fields are included
4. Update the `orderRank` to maintain priority ordering

### Modifying Specialties
1. Update the `specialtyColors` object in `app/page.tsx`
2. Add new color schemes following the existing pattern
3. Ensure accessibility compliance (WCAG AA contrast ratios)

### Styling Changes
- Global styles: `app/globals.css`
- Component styles: Tailwind classes in `app/page.tsx`
- Color scheme: Modify the `specialtyColors` object

## Technical Details

### Built With
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **shadcn/ui**: Component library

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Features
- **Client-side Rendering**: Fast interactions and filtering
- **Optimized Search**: Efficient filtering algorithms
- **Local Storage**: Persistent notes without server dependency
- **Responsive Images**: Optimized for all screen sizes

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
- Include proper error handling
- Write descriptive commit messages

## License

This project is intended for educational and clinical reference purposes. Please ensure compliance with local medical practice regulations and guidelines.

## Support

For technical issues or feature requests, please open an issue in the repository.

## Disclaimer

This tool is designed to assist healthcare professionals and should not replace clinical judgment or established medical protocols. Always follow your institution's guidelines and consult with senior colleagues when in doubt.
