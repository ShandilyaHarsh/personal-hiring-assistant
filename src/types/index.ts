export interface JobListing {
    title: string;
    companyName: string;
    location: string;
    workType: string;
    description: string;
    jobUrl: string;
}

export interface RankedJob extends JobListing {
    ranking: number;
    reasons: string[];
} 