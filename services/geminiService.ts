import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedIdea } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A catchy, viral-style title suitable for social media.'
    },
    coverIdea: {
      type: Type.OBJECT,
      properties: {
        visuals: {
          type: Type.STRING,
          description: 'A detailed description of the visual elements for the cover image, such as content, composition, color scheme, etc.'
        },
        textOverlay: {
          type: Type.STRING,
          description: 'The text content and layout suggestions for the cover image.'
        }
      }
    },
    contentSlides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slideNumber: {
            type: Type.INTEGER,
            description: 'The sequential number of the image, starting from 2.'
          },
          visualDescription: {
            type: Type.STRING,
            description: 'A detailed description of the content for this image, e.g., using charts, illustrations, or real photos, and can suggest generation with AI.'
          },
          textDescription: {
            type: Type.STRING,
            description: 'The key text points or explanations to overlay on this image.'
          }
        }
      }
    },
    caption: {
      type: Type.STRING,
      description: 'The complete post caption, including introduction, body, and conclusion, with appropriate emojis and #hashtags.'
    }
  }
};


export const generatePostIdea = async (topic: string): Promise<GeneratedIdea> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please detect the language of the following topic and generate the entire response in that same language. For example, if the topic is in English, all output (title, descriptions, caption, etc.) must be in English. If the topic is in Chinese, all output must be in Chinese.

请识别以下主题的语言，并使用该语言生成所有内容。例如，如果主题是英文，则所有输出（标题、描述、文案等）都必须是英文。如果主题是中文，则所有输出都必须是中文。

Topic/主题: '${topic}'

Based on this biology topic, generate a complete content plan for a Xiaohongshu (Little Red Book) post. You need to provide a catchy title, a detailed cover idea (including visuals and text overlay), a multi-slide content plan (describing the image and text for each slide), and a full post caption (with appropriate emojis and hashtags). Ensure the style is engaging, informative, and suitable for Xiaohongshu.`,
      config: {
        systemInstruction: "You are a top-tier social media strategist specializing in creating viral content for Xiaohongshu (Little Red Book). Your expertise is in transforming complex biology topics into visually appealing and easily understandable notes for a general audience. 你是一位顶级的社交媒体策略师，尤其擅长为小红书平台创作爆款内容。你的专长是将复杂的生物学知识，转化为对普通大众既有吸引力又易于理解的视觉化笔记。",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString);
    return parsedData as GeneratedIdea;

  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate post idea from Gemini API.");
  }
};


export const generateImagenImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4', // Common Xiaohongshu aspect ratio
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return base64ImageBytes;
  } catch(error) {
    console.error("Error generating image with Imagen:", error);
    throw new Error("Failed to generate image from Imagen API.");
  }
};

export const generateSlideImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in response.");

    } catch(error) {
        console.error("Error generating slide image:", error);
        throw new Error("Failed to generate slide image from API.");
    }
}