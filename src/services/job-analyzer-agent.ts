import { Agent, createTool, ToolExecutionContext } from "@mastra/core";
import { z } from "zod";

const JobListingSchema = z.object({
    location: z.string(),
    workType: z.string(),
    title: z.string(),
    companyName: z.string()
});

export const rankJobTool = createTool({
    id: "rankJob",
    inputSchema: z.object({
        job: JobListingSchema
    }),
    description: "Ranks a job based on given preferences",
    output: {
        type: 'object',
        properties: {
            score: { type: 'number', description: 'The numerical score for the job' },
            reasons: { 
                type: 'array',
                items: { type: 'string' },
                description: 'List of reasons for the score'
            }
        },
        required: ['score', 'reasons']
    },
    execute: async ({ context: { job } }) => {
        let score = 0;
        const reasons: string[] = [];

        // Location scoring
        if (job.workType === 'Remote') {
            score += 10;
            reasons.push('Remote position (+10)');
        } else if (job.location.includes('Bangalore') && job.workType === 'Hybrid') {
            score += 5;
            reasons.push('Hybrid in Bangalore (+5)');
        } else if (job.location.includes('Bangalore')) {
            score += 3;
            reasons.push('WFO in Bangalore (+3)');
        }

        // Role scoring
        if (job.title.toLowerCase().includes('founder') || 
            job.title.toLowerCase().includes('software engineer')) {
            score += 10;
            reasons.push('Founding/Software Engineering role (+10)');
        } else if (job.title.toLowerCase().includes('ai engineer')) {
            score += 5;
            reasons.push('AI Engineering role (+5)');
        }

        // Company location scoring
        if (job.companyName.match(/United States|Europe/i)) {
            score += 10;
            reasons.push('US/Europe based company (+10)');
        } else if (job.companyName.includes('India')) {
            score += 5;
            reasons.push('India based company (+5)');
        }

        return { score, reasons };
    }
});

export const jobAnalyzer = new Agent({
    name: "job-analyzer",
    instructions: "You are an expert job analyzer that helps rank jobs based on user preferences.",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4",
        toolChoice: "auto",
    },
    tools: { rankJob: rankJobTool }
}); 