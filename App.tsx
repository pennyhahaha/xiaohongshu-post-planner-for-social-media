import React, { useState, useCallback } from 'react';
import { generatePostIdea } from './services/geminiService';
import { GeneratedIdea } from './types';
import IdeaDisplay from './components/IdeaDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { SparklesIcon, LightbulbIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [idea, setIdea] = useState<GeneratedIdea | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a biology topic!');
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdea(null);
    setShowWelcome(false);

    try {
      const result = await generatePostIdea(topic);
      setIdea(result);
    } catch (err) {
      setError('Sorry, an error occurred while generating content. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    if (error) {
      setError(null);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-100 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        
        <header className="text-center mb-8 animate-fade-in-down">
          <div className="inline-block bg-white p-4 rounded-full shadow-md mb-4">
             <LightbulbIcon className="w-12 h-12 text-pink-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Biology Content Assistant
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a biology topic and let AI generate creative covers, titles, and content layouts for your social media posts!
          </p>
        </header>

        <div className="w-full max-w-2xl bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-200/80 transition-all duration-300">
          <div className="flex flex-col space-y-4">
            <label htmlFor="topic-input" className="text-lg font-semibold text-gray-700">
              Enter your biology topic
            </label>
            <textarea
              id="topic-input"
              value={topic}
              onChange={handleTopicChange}
              onKeyPress={handleKeyPress}
              placeholder="e.g., The magic of photosynthesis, Why humans need sleep, The secrets of DNA..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-shadow duration-200 resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isLoading ? 'Generating...' : 'Generate Content Plan'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-2xl w-full" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="w-full mt-10">
          {isLoading && <LoadingSpinner />}
          {idea && <IdeaDisplay idea={idea} />}
          {showWelcome && !isLoading && !idea && (
             <div className="text-center text-gray-500 mt-8 max-w-2xl mx-auto">
                <p className="text-xl">✨ Welcome! ✨</p>
                <p className="mt-2">Here, complex biology knowledge becomes fun, engaging, and easy to share.</p>
                <p className="mt-2">Try entering a topic to start creating your next viral post!</p>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;