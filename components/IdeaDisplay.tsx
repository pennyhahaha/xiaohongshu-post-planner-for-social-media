import React, { useState, useEffect } from 'react';
import { GeneratedIdea } from '../types';
import { CameraIcon, SlidesIcon, DocumentTextIcon, TitleIcon, ImageIcon } from './IconComponents';
import { generateImagenImage, generateSlideImage } from '../services/geminiService';

interface IdeaDisplayProps {
  idea: GeneratedIdea;
}

const ImageLoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
        <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-pink-500"></div>
    </div>
);

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
    <div className="p-4 bg-white/50 border-b border-gray-200/50">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        {icon}
        <span className="ml-3">{title}</span>
      </h3>
    </div>
    <div className="p-5 text-gray-700">
      {children}
    </div>
  </div>
);

const IdeaDisplay: React.FC<IdeaDisplayProps> = ({ idea }) => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCoverImageLoading, setIsCoverImageLoading] = useState(false);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});
  const [loadingSlides, setLoadingSlides] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const isChinese = /[\u4e00-\u9fa5]/.test(idea.title);

  useEffect(() => {
    setCoverImage(null);
    setIsCoverImageLoading(false);
    setSlideImages({});
    setLoadingSlides({});
    setError(null);
  }, [idea]);

  const handleGenerateCover = async () => {
    setIsCoverImageLoading(true);
    setError(null);
    const prompt = isChinese 
      ? `为一篇面向儿童的科普帖子生成一张封面图，主题是关于“${idea.title}”。视觉元素要求：${idea.coverIdea.visuals}。图片上需要清晰展示这些文字：“${idea.coverIdea.textOverlay}”。整体风格要求：可爱的手绘童趣风格，色彩明亮鲜艳，线条简单清晰，像一本有趣的儿童科普绘本封面，能够立刻吸引小朋友的注意力。`
      : `Generate a cover image for a children's science post about "${idea.title}". Visual elements required: ${idea.coverIdea.visuals}. Clearly display this text on the image: "${idea.coverIdea.textOverlay}". Overall style requirements: a cute, hand-drawn, child-like style with bright and vibrant colors and simple, clear lines. It should look like the cover of an interesting children's science picture book, able to immediately capture a child's attention.`;
    try {
      const imageBytes = await generateImagenImage(prompt);
      setCoverImage(imageBytes);
    } catch (e) {
      setError('Cover image generation failed. Please try again.');
    } finally {
      setIsCoverImageLoading(false);
    }
  };

  const handleGenerateSlide = async (slideNumber: number, visualDesc: string, textDesc: string) => {
    setLoadingSlides(prev => ({ ...prev, [slideNumber]: true }));
    setError(null);
    const prompt = isChinese
      ? `为一篇儿童科普帖子生成一张内页插图，主题关于“${idea.title}”。这张图需要用可爱的画面来解释“${textDesc}”这个知识点。视觉内容描述：${visualDesc}。风格要求：可爱的手绘童趣风格，色彩明亮，线条简单，符合儿童科普读物的插画风格，让复杂的概念变得一目了然，易于小朋友理解。`
      : `Generate an illustration for a children's science post about "${idea.title}". This image needs to explain the concept "${textDesc}" in a cute way. Visual description: ${visualDesc}. Style requirements: a cute, hand-drawn, child-like style with bright colors and simple lines, suitable for a children's science book illustration. Make the complex concept easy for a child to understand at a glance.`;
    try {
      const imageBytes = await generateSlideImage(prompt);
      setSlideImages(prev => ({ ...prev, [slideNumber]: imageBytes }));
    } catch (e) {
      setError(`Slide ${slideNumber} generation failed. Please try again.`);
    } finally {
      setLoadingSlides(prev => ({ ...prev, [slideNumber]: false }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
       {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
      <SectionCard title="Catchy Title" icon={<TitleIcon className="w-7 h-7 text-pink-500" />}>
        <p className="text-2xl font-semibold text-gray-900">{idea.title}</p>
      </SectionCard>

      <SectionCard title="Cover Idea" icon={<CameraIcon className="w-7 h-7 text-green-500" />}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg text-gray-800">Visuals:</h4>
            <p className="mt-1">{idea.coverIdea.visuals}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">Text Overlay:</h4>
            <p className="mt-1">{idea.coverIdea.textOverlay}</p>
          </div>
          <div className="pt-2">
            <button onClick={handleGenerateCover} disabled={isCoverImageLoading} className="inline-flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <ImageIcon className="w-5 h-5 mr-2" />
                {isCoverImageLoading ? 'Generating...' : 'AI Generate Cover (Imagen)'}
            </button>
          </div>
          <div className="mt-4 relative w-full max-w-sm mx-auto aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border">
              {isCoverImageLoading && <ImageLoadingSpinner />}
              {coverImage ? (
                <img src={`data:image/jpeg;base64,${coverImage}`} alt="Generated Cover" className="w-full h-full object-cover" />
              ) : !isCoverImageLoading && (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Click to generate cover image</div>
              )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Content Layout (Multi-Image)" icon={<SlidesIcon className="w-7 h-7 text-blue-500" />}>
        <div className="space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 text-gray-600 rounded-md flex items-center justify-center font-bold text-lg">
                Img 1
              </div>
              <div>
                <h5 className="font-bold text-gray-800">Cover</h5>
                <p className="text-sm text-gray-600">Use the suggested cover design above, or generate with AI</p>
              </div>
          </div>
          {idea.contentSlides.map((slide) => (
            <div key={slide.slideNumber} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 text-gray-600 rounded-md flex items-center justify-center font-bold text-lg">
                  Img {slide.slideNumber}
                </div>
                <div className="flex-grow">
                  <h5 className="font-bold text-gray-800">Visual Description:</h5>
                  <p className="text-sm mb-2">{slide.visualDescription}</p>
                  <h5 className="font-bold text-gray-800">Text Content:</h5>
                  <p className="text-sm">{slide.textDescription}</p>
                </div>
              </div>
               <div className="pt-4 pl-16">
                 <button onClick={() => handleGenerateSlide(slide.slideNumber, slide.visualDescription, slide.textDescription)} disabled={loadingSlides[slide.slideNumber]} className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    {loadingSlides[slide.slideNumber] ? 'Generating...' : 'AI Generate Image'}
                 </button>
               </div>
               <div className="mt-4 ml-16 relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                {loadingSlides[slide.slideNumber] && <ImageLoadingSpinner />}
                {slideImages[slide.slideNumber] ? (
                    <img src={`data:image/png;base64,${slideImages[slide.slideNumber]}`} alt={`Generated content slide ${slide.slideNumber}`} className="w-full h-full object-cover" />
                ): !loadingSlides[slide.slideNumber] && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Click to generate content image</div>
                )}
               </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Post Caption" icon={<DocumentTextIcon className="w-7 h-7 text-purple-500" />}>
        <p className="whitespace-pre-wrap leading-relaxed">{idea.caption}</p>
      </SectionCard>
    </div>
  );
};

export default IdeaDisplay;