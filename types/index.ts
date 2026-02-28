export type UserRole = 'student' | 'academic' | 'professor' | 'admin';

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    subscription_tier: 'free' | 'pro' | 'institution' | 'student' | 'academic';
    is_admin?: boolean;
}

export interface Document {
    id: string;
    user_id: string;
    title: string;
    file_url: string;
    file_type: 'pdf' | 'audio' | 'url';
    created_at: string;
    updated_at: string;
    analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
    metadata?: {
        author?: string;
        publication_date?: string;
        page_count?: number;
        duration?: number; // for audio
    };
}

export interface AnalysisResult {
    id: string;
    document_id: string;
    summary: string;
    key_points: string[];
    glossary: Record<string, string>;
    academic_level: UserRole;
    mind_map_data?: any; // To be defined with D3/ReactFlow structure
    citations?: string[];
    critique?: {
        strengths: string[];
        weaknesses: string[];
        methodology_check: string;
    };
}
