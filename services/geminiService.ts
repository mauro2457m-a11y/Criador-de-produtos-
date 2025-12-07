
import { GoogleGenAI, Type } from "@google/genai";
import { DigitalPackage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const packageSchema = {
    type: Type.OBJECT,
    properties: {
        ebook: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título conciso e atraente para o ebook." },
                chapters: {
                    type: Type.ARRAY,
                    description: "Pelo menos 5 capítulos detalhados para o ebook.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "Título do capítulo." },
                            content: { type: Type.STRING, description: "Conteúdo detalhado do capítulo, com pelo menos 300 palavras." }
                        },
                        required: ['title', 'content']
                    }
                }
            },
            required: ['title', 'chapters']
        },
        posts: {
            type: Type.ARRAY,
            description: "Exatamente 5 posts para redes sociais (Instagram/Facebook) para promover o ebook, incluindo hashtags relevantes.",
            items: { type: Type.STRING }
        },
        coverPrompt: {
            type: Type.STRING,
            description: "Um prompt detalhado em inglês para um gerador de imagens de IA criar uma capa de ebook profissional e visualmente atraente. Inclua estilo, cores, imagens e tipografia."
        },
        bonus: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para o material bônus (ex: Checklist, Guia Rápido)." },
                content: { type: Type.STRING, description: "Conteúdo prático para o bônus, como uma lista de verificação ou um guia passo a passo." }
            },
            required: ['title', 'content']
        },
        salesScript: {
            type: Type.STRING,
            description: "Um roteiro de vendas persuasivo para uma página de destino ou vídeo, destacando os benefícios do pacote e com uma chamada para ação clara."
        }
    },
    required: ['ebook', 'posts', 'coverPrompt', 'bonus', 'salesScript']
};


export const generateDigitalPackage = async (topic: string): Promise<{ digitalPackage: DigitalPackage; coverImageUrl: string; }> => {
    // 1. Generate all text content and the image prompt in one call
    const textGenerationModel = 'gemini-3-pro-preview';
    const prompt = `Aja como um especialista em marketing digital e criador de conteúdo. Crie um pacote digital completo para revenda sobre o tópico: "${topic}". O pacote deve ser de alta qualidade, prático e pronto para ser comercializado. Gere um objeto JSON seguindo o schema fornecido.`;

    const textResponse = await ai.models.generateContent({
        model: textGenerationModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: packageSchema,
        },
    });

    if (!textResponse.text) {
        throw new Error('A API de geração de texto não retornou conteúdo.');
    }

    const digitalPackage: DigitalPackage = JSON.parse(textResponse.text);

    // 2. Generate the ebook cover using the prompt from the first response
    const imageGenerationModel = 'gemini-2.5-flash-image';
    
    const imageResponse = await ai.models.generateContent({
        model: imageGenerationModel,
        contents: {
            parts: [{ text: digitalPackage.coverPrompt }],
        },
        config: {
           imageConfig: {
              aspectRatio: "3:4",
            },
        }
    });

    const firstCandidate = imageResponse.candidates?.[0];
    if (!firstCandidate || !firstCandidate.content.parts) {
         throw new Error('A API de imagem não retornou candidatos válidos.');
    }
    
    const imagePart = firstCandidate.content.parts.find(part => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
        throw new Error('A API de imagem não retornou dados de imagem.');
    }
    
    const base64ImageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    const coverImageUrl = `data:${mimeType};base64,${base64ImageData}`;

    return { digitalPackage, coverImageUrl };
};
