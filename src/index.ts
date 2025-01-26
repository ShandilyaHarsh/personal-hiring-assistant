import { rankJobs } from './services/job-ranking-workflow.js';

async function main() {
    try {
        const rankedJobs = await rankJobs();
        console.log(JSON.stringify(rankedJobs, null, 2));
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

main(); 