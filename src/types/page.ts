export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
}

export interface CardItem {
    title: string;
    subtitle?: string;
    date?: string;
    compact?: boolean;
    highlight?: string;
    content?: string;
    tags?: string[];
    link?: string;
    image?: string;
}

export interface CardPageSummaryConfig {
    eyebrow?: string;
}

export interface CardSection {
    title: string;
    description?: string;
    items: CardItem[];
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    variant?: 'awards' | string;
    items?: CardItem[];
    sections?: CardSection[];
    empty?: string;
    summary?: CardPageSummaryConfig;
}
