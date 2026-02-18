export interface StudentAttempt {
    question_id: string;
    topic: string;
    concept: string;
    importance: 'A' | 'B' | 'C';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    is_correct: boolean;
    time_taken: number;
    expected_time: number;
    marks: number;
    neg_marks: number;
    username?: string; // Added optional username as seen in AdminConsole usage
}

export interface SQIResult {
    student_id: string;
    overall_sqi: number;
    topic_scores: Record<string, { topic: string; sqi: number }>;
    concept_scores: { topic: string; concept: string; sqi: number }[];
    ranked_concepts_for_summary: RankingResult[];
    metadata: any;
}

export interface RankingResult {
    topic: string;
    concept: string;
    weight: number;
    reasons: string[];
}
