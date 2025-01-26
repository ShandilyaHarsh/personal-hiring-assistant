# Personal Hiring Assistant

A smart job search automation tool that scrapes LinkedIn job listings and ranks them based on customizable criteria. This tool helps streamline your job search by automatically finding and evaluating job opportunities that match your preferences.

## Features

- Automated LinkedIn job scraping
- Customizable job ranking system
- Filters for work type, location, and company preferences
- Support for remote, hybrid, and on-site positions
- Automated job analysis and scoring

## Technology Stack

### Core Technologies
- **TypeScript**: Strongly-typed JavaScript for robust application development
- **Node.js**: Runtime environment for executing JavaScript server-side
- **Zod**: Schema validation and type inference
- **Apify**: Web scraping and automation platform for LinkedIn data collection

### Mastra AI Framework
The project leverages Mastra AI, a powerful workflow automation framework that enables:

#### Key Components
- **Workflow Orchestration**: Defines and manages complex job processing pipelines
- **Agent System**: Intelligent agents that perform specialized tasks like job analysis
- **Tools**: Modular components for specific operations (e.g., job ranking, data processing)

#### Architecture
```
Workflow
└── Steps
    ├── Scraping (LinkedIn data collection)
    ├── Analysis (Job evaluation)
    └── Ranking (Score calculation)
```

#### Features
- **Declarative Workflows**: Define complex processes using a simple, readable syntax
- **Type Safety**: Full TypeScript integration for reliable code
- **Schema Validation**: Built-in data validation using Zod
- **Context Management**: Efficient state management between workflow steps
- **Error Handling**: Robust error management and recovery mechanisms

#### Example Usage
```typescript
export const jobRankingWorkflow = new Workflow({
    name: "job-ranking-workflow",
    triggerSchema: LinkedInInputSchema
});

jobRankingWorkflow
    .step(new Step({
        id: "scrapeStep",
        outputSchema: ScrapeOutputSchema,
        execute: async ({ context }) => {
            // Workflow implementation
        }
    }))
    .then(/* next steps */);
```

### Integration Points
- **LinkedIn Scraping**: Apify integration for job data collection
- **Data Processing**: Mastra agents for intelligent data analysis
- **Ranking System**: Custom scoring algorithms using Mastra tools
- **Type Safety**: End-to-end type checking with TypeScript and Zod

## Setup Instructions

1. **Prerequisites**
   - Node.js (v16 or higher)
   - npm or yarn
   - An Apify account for LinkedIn scraping
   - OpenAI API key for job analysis

2. **Installation**
   ```bash
   # Clone the repository
   git clone [your-repo-url]
   cd personal-hiring-assistant

   # Install dependencies
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following:
   ```
   APIFY_TOKEN=your_apify_token
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Build and Run**
   ```bash
   # Build the project
   npm run build

   # Run the application
   npm start

   # For development with hot-reload
   npm run dev
   ```

## Usage

The tool is configured to search for software engineering positions by default. You can modify the search parameters in `src/services/job-ranking-workflow.ts`:

## Preference Configuration

### Available Preferences

#### Location Preferences
- **Remote Work**: Highest priority for fully remote positions (+10 points)
- **Hybrid in Bangalore**: Medium priority (+5 points)
- **On-site in Bangalore**: Lower priority (+3 points)

#### Role Type Preferences
- **Primary Roles** (+10 points):
  - Software Engineer positions
  - Founding team positions
- **Secondary Roles** (+5 points):
  - AI Engineer positions

#### Company Location Preferences
- **Primary Markets** (+10 points):
  - United States based companies
  - Europe based companies
- **Secondary Markets** (+5 points):
  - India based companies

### Customizing Preferences

You can modify the scoring weights and criteria in `src/services/job-analyzer-agent.ts`:

```typescript
export const rankJobTool = createTool({
    // ... other configuration ...
    execute: async ({ context: { job } }) => {
        let score = 0;
        const reasons: string[] = [];

        // Modify scoring weights here
        if (job.workType === 'Remote') {
            score += 10;  // Adjust this value to change remote work priority
            reasons.push('Remote position (+10)');
        }
        
        // Add custom scoring rules
        if (job.title.toLowerCase().includes('your_preferred_role')) {
            score += 10;
            reasons.push('Preferred role (+10)');
        }

        return { score, reasons };
    }
});
```

### Adding New Preferences

To add new preference criteria:

1. Update the `JobListing` interface in `src/types/index.ts`
2. Modify the `JobListingSchema` in `src/services/linkedin-scraper.ts`
3. Add new scoring rules in `src/services/job-analyzer-agent.ts`

Example of adding a new preference for company size:
```typescript
// In job-analyzer-agent.ts
if (job.companySize === 'startup') {
    score += 8;
    reasons.push('Startup company (+8)');
} else if (job.companySize === 'enterprise') {
    score += 3;
    reasons.push('Enterprise company (+3)');
}
```