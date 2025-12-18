export type ClubEventType = "MATCH" | "TRAINING" | "TRIAL" | "SEMINAR" | "MEETING" | "OTHER";
export type ClubEventStatus = "SCHEDULED" | "CONFIRMED" | "POSTPONED" | "CANCELLED" | "COMPLETED";
export type HomeAway = "HOME" | "AWAY" | null;

export interface ClubEventDTO {
  id: string;
  type: ClubEventType;
  title: string;
  startAt: string; // ISO
  endAt?: string | null; // ISO
  allDay: boolean;
  venueName?: string | null;
  venueAddress?: string | null;
  googleMapsUrl?: string | null;
  competition?: string | null;
  opponent?: string | null;
  homeAway?: HomeAway;
  teamId?: number | null;
  centerId?: number | null;
  status: ClubEventStatus;
  notes?: string | null;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
}


