import { Step, Workflow, Mastra } from "@mastra/core";
import { z } from "zod";
import { scrapeLinkedInJobs } from './linkedin-scraper.js';
import { jobAnalyzer, rankJobTool } from './job-analyzer-agent.js';
import { RankedJob } from '../types';

const LinkedInInputSchema = z.object({
    workType: z.string(),
    rows: z.number(),
    experienceLevel: z.string(),
    publishedAt: z.string(),
    title: z.string(),
    proxy: z.object({
        useApifyProxy: z.boolean(),
        apifyProxyGroups: z.array(z.string())
    })
});

// Define output schemas
const ScrapeOutputSchema = z.array(z.object({
    title: z.string(),
    companyName: z.string(),
    location: z.string(),
    workType: z.string(),
    jobUrl: z.string()
}));

export const mastra = new Mastra({
    agents: { jobAnalyzer }
});

export const jobRankingWorkflow = new Workflow({
    name: "job-ranking-workflow",
    triggerSchema: LinkedInInputSchema
});

jobRankingWorkflow
    .step(
        new Step({
            id: "scrapeStep",
            outputSchema: ScrapeOutputSchema,
            execute: async ({ context: { machineContext } }) => {
                return scrapeLinkedInJobs(machineContext?.triggerData);
            }
        })
    )
    .then(
        new Step({
            id: "analyzeJobs",
            outputSchema: z.array(z.object({
                title: z.string(),
                companyName: z.string(),
                location: z.string(),
                workType: z.string(),
                ranking: z.number(),
                reasons: z.array(z.string())
            })),
            execute: async ({ context: { machineContext } }) => {
                const jobsResult = machineContext?.stepResults.scrapeStep;
    
                // Check if the result is a success before accessing payload
                if (!jobsResult) {
                    throw new Error("Job scraping failed");
                }
                if ('payload' in jobsResult) {
                    const jobs = jobsResult.payload;
                    const rankedJobs: RankedJob[] = [];
                    
                    for (const job of jobs) {
                        // Ensure job has all required fields
                        if (!job.location || !job.workType || !job.title || !job.companyName) {
                            console.warn(`Skipping job due to missing required fields:`, job);
                            continue;
                        }
                        const analysis = await rankJobTool.execute({
                            context: {
                                job: {
                                    location: job.location,
                                    workType: job.workType,
                                    title: job.title,
                                    companyName: job.companyName
                                }
                            },
                            suspend: () => Promise.resolve()
                        }) as { score: number; reasons: string[] };

                        rankedJobs.push({
                            ...job,
                            ranking: analysis.score,
                            reasons: analysis.reasons
                        });
                    }
                    
                    return rankedJobs.sort((a, b) => b.ranking - a.ranking);
                } else {
                    throw new Error("Job scraping failed");
                }
            }
        })
    )    
    .then(
        new Step({
            id: "formatOutput",
            outputSchema: z.array(z.object({
                title: z.string(),
                companyName: z.string(),
                location: z.string(),
                workType: z.string(),
                ranking: z.number(),
                reasons: z.array(z.string()),
                url: z.string()
            })),
            execute: async ({ context: { machineContext } }) => {
                const rankedJobsResult = machineContext?.stepResults.analyzeJobs;

                // Check if the result is a success before accessing payload
                if (!rankedJobsResult) {
                    throw new Error("Job analysis failed");
                }
                if ('payload' in rankedJobsResult) {
                    const rankedJobs = rankedJobsResult.payload;
                    return rankedJobs.map((job: RankedJob) => ({
                        title: job.title,
                        companyName: job.companyName,
                        location: job.location,
                        workType: job.workType,
                        ranking: job.ranking,
                        reasons: job.reasons,
                        jobUrl: job.jobUrl
                    }));
                } else {
                    throw new Error("Job analysis failed");
                }
            }
        })
    )
    .commit();

// Function to run the workflow
export async function rankJobs(): Promise<RankedJob[]> {
    const input = {
        workType: "3",
        rows: 10,
        experienceLevel: "1",
        publishedAt: "r86400",
        title: "software engineer",
        proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ["RESIDENTIAL"]
        }
    };

    const result = await jobRankingWorkflow.execute({
        triggerData: input
    });
     
    
    if (!result?.results?.formatOutput || !('payload' in result.results.formatOutput)) {
        throw new Error("Workflow execution failed");
    }
    
    return result.results.formatOutput.payload;
}

