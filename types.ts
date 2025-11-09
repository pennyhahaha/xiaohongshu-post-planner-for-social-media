
export interface ContentSlide {
  slideNumber: number;
  visualDescription: string;
  textDescription: string;
}

export interface GeneratedIdea {
  title: string;
  caption: string;
  coverIdea: {
    visuals: string;
    textOverlay: string;
  };
  contentSlides: ContentSlide[];
}
