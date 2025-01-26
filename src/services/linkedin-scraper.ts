import { ApifyClient } from 'apify-client';
import { config } from '../config/env.js';
import { JobListing } from '../types';
import { z } from 'zod';
import { webcrypto as crypto } from 'node:crypto';

const client = new ApifyClient({
    token: config.apifyToken,
});

const LinkedInInputSchema = z.object({
    workType: z.string(),
    rows: z.number(),
    experienceLevel: z.array(z.string()),
    publishedAt: z.string(),
    title: z.string(),
    proxy: z.object({
        useApifyProxy: z.boolean(),
        apifyProxyGroups: z.array(z.string())
    })
});

const JobListingSchema = z.object({
    title: z.string(),
    companyName: z.string(),
    location: z.string(),
    workType: z.string(),
    description: z.string(),
    salary: z.string().optional(),
    jobUrl: z.string()
});

export async function scrapeLinkedInJobs(input: z.infer<typeof LinkedInInputSchema>): Promise<JobListing[]> {
    try {
        const run = await client.actor("bebity/linkedin-jobs-scraper").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        console.log('Raw LinkedIn data:', JSON.stringify(items[0], null, 2));
        
        return z.array(JobListingSchema).parse(items);
    } catch (error) {
        console.error('Error scraping LinkedIn jobs:', error);
        throw error;
    }
} 