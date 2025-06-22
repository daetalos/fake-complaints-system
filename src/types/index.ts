export type UUID = string;

export interface Complaint {
    complaint_id: UUID;
    description: string;
    created_at: Date;
    updated_at: Date;
} 