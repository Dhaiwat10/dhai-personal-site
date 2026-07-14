export interface GitHubStats {
  followers: number;
  totalStars: number;
  latestRepos: LatestRepo[];
}

export interface LatestRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  updatedAt: string;
  stars: number;
}