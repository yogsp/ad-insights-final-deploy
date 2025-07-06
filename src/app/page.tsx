"use client";

import React, { useState, useCallback, useMemo, FC, useEffect } from 'react';
import { UploadCloud, FileImage, Palette, Type, Users, Lightbulb, CheckCircle, XCircle, Star, BarChart2, MessageSquare, Monitor } from 'lucide-react';

// --- Type Definitions for TypeScript ---

interface AnalysisItem {
  vibe?: string;
  recommendation?: string;
  focus?: string;
  type?: string;
  clarity?: string;
  hierarchy?: string;
  logoVisibility?: string;
}

interface AnalysisData {
  colorPalette?: Partial<AnalysisItem>;
  subjectAndComposition?: Partial<AnalysisItem>;
  typographyAndText?: Partial<AnalysisItem>;
  brandIntegration?: Partial<AnalysisItem>;
  callToAction?: Partial<AnalysisItem>;
}

interface AnalysisResult {
  overallScore: number;
  oneLiner: string;
  strengths: string[];
  improvements: string[];
  analysis: AnalysisData;
}

// --- Main App Component ---
const App: FC = () => {
  const [activeTab, setActiveTab] = useState('analyzer');

  // This useEffect hook ensures that the style tag is only appended on the client-side.
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = ` @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } `;
    document.head.append(style);
  }, []);


  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Ad<span className="text-indigo-600">Insight</span>
          </h1>
          <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">
            AI-powered analysis to predict and improve the performance of your image ads.
          </p>
        </header>

        <div className="flex justify-center border-b border-slate-200 mb-8">
          <TabButton
            label="Ad Analyzer"
            isActive={activeTab === 'analyzer'}
            onClick={() => setActiveTab('analyzer')}
            icon={<BarChart2 className="w-5 h-5 mr-2" />}
          />
          <TabButton
            label="Performance Guide"
            isActive={activeTab === 'guide'}
            onClick={() => setActiveTab('guide')}
            icon={<Lightbulb className="w-5 h-5 mr-2" />}
          />
        </div>

        <main>
          {activeTab === 'analyzer' && <AdAnalyzer />}
          {activeTab === 'guide' && <PerformanceGuide />}
        </main>

        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AdInsight. For Internal Use of Stratuscast Phils., Inc. Powered by Gemini.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;


// --- Component Props Interfaces ---

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

interface PlatformButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface OverallScoreProps {
  score: number | null;
  oneLiner: string | null;
}

interface FeedbackCardProps {
  title: string;
  items: string[] | null | undefined;
  icon: React.ReactNode;
}

interface DetailedAnalysisProps {
  data: AnalysisData | null | undefined;
}

interface AnalysisDetailItemProps {
  icon: React.ReactNode;
  title: string;
  vibe?: string;
  details?: { label: string; value?: string }[];
  recommendation?: string;
}

// --- Ad Analyzer Tab Content ---
const AdAnalyzer: FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [platform, setPlatform] = useState('social');
    
    // Initialize API key state as an empty string.
    const [apiKey, setApiKey] = useState('');

    // This useEffect hook runs only on the client-side after the component mounts.
    // This is the correct way to access localStorage in Next.js.
    useEffect(() => {
        const storedApiKey = localStorage.getItem('geminiApiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);


    // Handle API key changes and save to localStorage
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        localStorage.setItem('geminiApiKey', newKey);
    };

    const handleImageChange = (file: File | undefined) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setAnalysisResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        } else {
            setError("Please upload a valid image file (PNG, JPG, etc.).");
            setImage(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleImageChange(e.target.files?.[0]);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, []);

    const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const generatePrompt = (selectedPlatform: string) => {
        let platformContext = '';
        if (selectedPlatform === 'social') {
            platformContext = "The ad is for a social media feed (e.g., Facebook, Instagram). Prioritize analysis on thumb-stopping power, engagement potential, and clarity on a mobile device.";
        } else {
            platformContext = "The ad is a display/banner ad (e.g., Google Display Network). Prioritize analysis on its ability to grab attention instantly, the clarity of a single call-to-action, and effectiveness in a small format.";
        }
        return `As an expert marketing analyst, analyze the provided ad image. ${platformContext} Your response must be a valid JSON object. The JSON should strictly follow this schema, with all fields present: {"overallScore": number, "oneLiner": "string", "strengths": ["string"], "improvements": ["string"], "analysis": {"colorPalette": {"vibe": "string", "recommendation": "string"}, "subjectAndComposition": {"focus": "string", "type": "string", "recommendation": "string"}, "typographyAndText": {"clarity": "string", "hierarchy": "string", "recommendation": "string"}, "brandIntegration": {"logoVisibility": "string", "recommendation": "string"}, "callToAction": {"clarity": "string", "recommendation": "string"}}}`;
    };

    const handleAnalyze = async () => {
        if (!image) { setError("Please upload an image first."); return; }
        if (!apiKey.trim()) { setError("Please enter your Gemini API key to proceed."); return; }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const base64ImageData = image.split(',')[1];
            const prompt = generatePrompt(platform);
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: base64ImageData } }] }] };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorBody = await response.text(); throw new Error(`API request failed with status ${response.status}: ${errorBody}`); }
            const result = await response.json();
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
                const jsonText = result.candidates[0].content.parts[0].text.trim().replace(/```json/g, '').replace(/```/g, '');
                const parsedJson = JSON.parse(jsonText);
                setAnalysisResult(parsedJson);
            } else { throw new Error("Failed to get a valid analysis from the AI."); }
        } catch (err: any) { setError(`An error occurred: ${err.message}. Please try again.`); } finally { setIsLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 space-y-4">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Configure & Upload</h2>
                     <div className="mb-4">
                        <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
                        <input type="password" id="api-key" value={apiKey} onChange={handleApiKeyChange} placeholder="Enter your API key here" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ad Platform</label>
                        <div className="grid grid-cols-2 gap-2">
                            <PlatformButton label="Social Media" icon={<MessageSquare className="w-5 h-5 mr-2"/>} isActive={platform === 'social'} onClick={() => setPlatform('social')} />
                            <PlatformButton label="Display/Banner" icon={<Monitor className="w-5 h-5 mr-2"/>} isActive={platform === 'display'} onClick={() => setPlatform('display')} />
                        </div>
                    </div>
                    <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`} onDrop={handleDrop} onDragOver={handleDragEvents} onDragEnter={handleDragEvents} onDragLeave={handleDragEvents}>
                        <input type="file" id="file-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleFileSelect} disabled={isLoading} />
                        <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                            <UploadCloud className="w-12 h-12 text-slate-400" />
                            <p className="font-semibold"><span className="text-indigo-600">Click to upload</span> or drag and drop</p>
                            <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                </div>
                {image && (
                    <div className="mt-2">
                        <h3 className="font-semibold text-slate-700 mb-2">Image Preview:</h3>
                        <div className="relative group">
                            <img src={image} alt="Ad preview" className="w-full h-auto rounded-lg object-contain max-h-80 shadow-md" />
                            <button onClick={() => { setImage(null); setAnalysisResult(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Remove image"><XCircle className="w-5 h-5"/></button>
                        </div>
                    </div>
                )}
                <div className="mt-2">
                    <button onClick={handleAnalyze} disabled={!image || isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center justify-center shadow-sm">
                        {isLoading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...</> ) : '2. Analyze Ad Performance'}
                    </button>
                    {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Performance Analysis</h2>
                 {!analysisResult && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50 rounded-lg p-8"><FileImage className="w-16 h-16 text-slate-400 mb-4" /><h3 className="text-xl font-semibold text-slate-700">Awaiting Analysis</h3><p className="max-w-xs mt-1">Upload an image and click "Analyze" to see your ad's performance prediction.</p></div>
                )}
                {isLoading && (
                     <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8"><div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 mb-4"></div><style>{`.loader{border-top-color:#4f46e5;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style><h3 className="text-xl font-semibold text-slate-700 animate-pulse">Running AI Analysis...</h3><p className="max-w-xs mt-1">This may take a few moments.</p></div>
                )}
                {analysisResult && (
                    <div className="space-y-6 animate-fade-in">
                      <OverallScore score={analysisResult.overallScore} oneLiner={analysisResult.oneLiner} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FeedbackCard title="Key Strengths" items={analysisResult.strengths} icon={<CheckCircle className="text-green-500"/>} /><FeedbackCard title="Areas for Improvement" items={analysisResult.improvements} icon={<XCircle className="text-red-500"/>} /></div>
                      <DetailedAnalysis data={analysisResult.analysis} />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Child Components ---

const TabButton: FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => (
  <button onClick={onClick} className={`flex items-center justify-center px-4 sm:px-6 py-3 font-semibold rounded-t-lg transition-all ${ isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-500' }`}>{icon}{label}</button>
);

const PlatformButton: FC<PlatformButtonProps> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center justify-center w-full px-3 py-2 text-sm font-semibold border rounded-md transition-colors ${ isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50' }`}>{icon}{label}</button>
);

const scoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-500 bg-slate-50';
    if (score >= 85) return 'text-green-500 bg-green-50';
    if (score >= 60) return 'text-yellow-500 bg-yellow-50';
    return 'text-red-500 bg-red-50';
}

const OverallScore: FC<OverallScoreProps> = ({ score, oneLiner }) => (
    <div className="text-center p-6 bg-slate-50 rounded-xl">
        <p className="font-semibold text-slate-600 mb-2">Predicted Performance Score</p>
        <div className={`mx-auto w-28 h-28 rounded-full flex items-center justify-center ${scoreColor(score)}`}><span className="text-5xl font-bold">{score || 0}</span><span className="text-2xl font-semibold mt-2">/100</span></div>
        <p className="text-slate-700 font-semibold mt-4 text-lg italic">"{oneLiner || 'Analysis summary unavailable.'}"</p>
    </div>
);

const FeedbackCard: FC<FeedbackCardProps> = ({ title, items, icon }) => (
    <div className="bg-slate-50/70 p-4 rounded-lg">
        <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center"><span className="mr-2">{icon}</span>{title}</h3>
        <ul className="space-y-2">{(items && items.length > 0) ? items.map((item, index) => (<li key={index} className="flex items-start"><Star className="w-4 h-4 text-indigo-400 mr-2 mt-1 flex-shrink-0" /><span className="text-slate-600 text-sm">{item}</span></li>)) : <li className="text-slate-500 text-sm">No items to display.</li>}</ul>
    </div>
);

const DetailedAnalysis: FC<DetailedAnalysisProps> = ({ data }) => {
  const analysisItems = useMemo(() => {
      if (!data) return [];
      return [
        { icon: <Palette className="w-6 h-6 text-indigo-500" />, title: "Color Palette", vibe: data.colorPalette?.vibe, recommendation: data.colorPalette?.recommendation },
        { icon: <Users className="w-6 h-6 text-indigo-500" />, title: "Subject & Composition", details: [{ label: "Focus", value: data.subjectAndComposition?.focus }, { label: "Type", value: data.subjectAndComposition?.type }], recommendation: data.subjectAndComposition?.recommendation },
        { icon: <Type className="w-6 h-6 text-indigo-500" />, title: "Typography & Text", details: [{ label: "Clarity", value: data.typographyAndText?.clarity }, { label: "Hierarchy", value: data.typographyAndText?.hierarchy }], recommendation: data.typographyAndText?.recommendation },
      ];
  }, [data]);

  if (!data) { return <div className="text-center text-slate-500 p-4"><p>Detailed analysis could not be loaded.</p></div>; }
  return (
    <div>
      <h3 className="font-bold text-xl text-slate-800 mb-4 text-center border-t pt-6">Detailed Breakdown</h3>
      <div className="space-y-4">{analysisItems.map(item => <AnalysisDetailItem key={item.title} {...item} />)}</div>
    </div>
  );
};

const AnalysisDetailItem: FC<AnalysisDetailItemProps> = ({ icon, title, vibe, details, recommendation }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center mb-2">{icon}<h4 className="font-semibold text-md text-slate-700 ml-3">{title}</h4></div>
        <div className="pl-9 text-sm text-slate-600 space-y-2">
            {vibe && <p><strong>Vibe:</strong> {vibe}</p>}
            {details?.map(d => d.value && <p key={d.label}><strong>{d.label}:</strong> {d.value}</p>)}
            {recommendation && <p className="mt-2 pt-2 border-t border-slate-100"><strong className="text-indigo-600">Suggestion:</strong> {recommendation}</p>}
        </div>
    </div>
);

const PerformanceGuide: FC = () => {
    const principles = [ { icon: <Palette className="w-8 h-8 text-rose-500" />, title: "Use Color Strategically", description: "Colors evoke emotion. Use a palette that aligns with your brand's personality and the feeling you want to inspire. High contrast between background and foreground elements (especially text) is crucial for readability.", }, { icon: <Users className="w-8 h-8 text-sky-500" />, title: "Show Faces When Possible", description: "Human faces, especially those showing positive emotion, are incredibly effective at capturing attention and building a connection. Our brains are wired to notice faces.", }, { icon: <Type className="w-8 h-8 text-amber-500" />, title: "Prioritize Text Clarity", description: "Your message must be readable in seconds, especially on mobile. Use large, clean fonts. Keep copy concise. Ensure a clear visual hierarchy: Headline > Benefit > Call to Action.", }, { icon: <FileImage className="w-8 h-8 text-teal-500" />, title: "Keep It Simple & Focused", description: "A single, clear focal point is more effective than a cluttered image. The viewer should immediately understand what the ad is about. Avoid visual noise that distracts from the core message.", }, { icon: <Star className="w-8 h-8 text-indigo-500" />, title: "Clear Call to Action (CTA)", description: "Tell the user exactly what you want them to do next ('Shop Now', 'Learn More', 'Sign Up'). Make the CTA visually distinct using a button or contrasting text.", }, { icon: <CheckCircle className="w-8 h-8 text-emerald-500" />, title: "Authenticity Over Perfection", description: "User-generated content (UGC) and less-polished, 'real' looking photos often outperform slick, professional studio shots. They build trust and feel more relatable.", }, ];
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Best Practices for High-Performing Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {principles.map((p) => ( <div key={p.title} className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all"><div className="flex items-center mb-3"><div className="p-2 bg-white rounded-full shadow-sm mr-4">{p.icon}</div><h3 className="font-bold text-lg text-slate-800">{p.title}</h3></div><p className="text-slate-600 text-sm">{p.description}</p></div> ))}
            </div>
        </div>
    );
};
