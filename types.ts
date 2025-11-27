export interface Location {
  latitude: number;
  longitude: number;
}

// Interfaces tailored for the Grounding output
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeId?: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
            author?: string;
        }[]
    }
  };
}

export interface SearchResult {
  text: string;
  locations: GroundingChunk[];
}

export interface WorkoutPlan {
  parkName: string;
  routine: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  GENERATING_WORKOUT = 'GENERATING_WORKOUT'
}