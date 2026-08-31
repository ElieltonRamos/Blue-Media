export interface ReportFilters {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface TopMedia {
  mediaTitle: string;
  playCount: number;
}

export interface PlaysByClient {
  clientId: number;
  clientName: string;
  playCount: number;
}

export interface UnusedMedia {
  id: number;
  title: string;
}

export interface ReportData {
  totalClients: number;
  totalMedia: number;
  totalPlaybacksInPeriod: number;
  topMedia: TopMedia[];
  playsByClient: PlaysByClient[];
  unusedMedia: UnusedMedia[];
}
