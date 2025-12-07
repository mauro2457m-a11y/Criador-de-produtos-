
export interface EbookChapter {
    title: string;
    content: string;
}

export interface Ebook {
    title: string;
    chapters: EbookChapter[];
}

export interface Bonus {
    title: string;
    content: string;
}

export interface DigitalPackage {
    ebook: Ebook;
    posts: string[];
    coverPrompt: string;
    bonus: Bonus;
    salesScript: string;
}
