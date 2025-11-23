export interface TemplateField {
    name: string;
    type: 'text' | 'number' | 'currency';
}

export interface Template {
    id: string;
    created_at: string;
    owner_id: string;
    name: string;
    category: string;
    fields: TemplateField[];
    is_archived: boolean;
}

export interface Item {
    id: string;
    created_at: string;
    template_id: string;
    url: string;
    title: string;
    price: number;
    currency: string;
    image_url: string;
    description: string;
    metadata: Record<string, any>;
    user_notes: string;
    vote_count?: number;
    comment_count?: number;
}

export interface Vote {
    item_id: string;
    user_id: string;
    created_at: string;
}

export interface Comment {
    id: string;
    item_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user_email?: string;
}
