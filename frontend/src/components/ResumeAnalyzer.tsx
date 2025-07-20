import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Brain,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Target,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  ClipboardCheck,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface AnalysisObject {
  strengths: string[];
  improvements: string[];
  matching_qualifications: string;
  missing_requirements: string;
  final_assessment: string;
}

interface AnalysisResult {
  parsed: any;
  analysis: AnalysisObject;
  score: number;
  suggestions: string;
  roadmap: string;
}

const profiles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UI/UX Designer",
];

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobMode, setJobMode] = useState<"description" | "profile">("profile");
  const [selectedProfile, setSelectedProfile] = useState("Frontend Developer");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [isLoading, setIsLoading] = useState (false);
  const [progress, setProgress] = useState (0);
  const intervalRef = useRef(null); // To manage the timer

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!file) return alert("Please upload a resume first.");

    setIsAnalyzing(true);
    setAnalysisResult(null);

    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("resume", file);

    const description = jobMode === "profile" ? selectedProfile : jobDescription;
    formData.append("job_description", description);

    //status bar time interval
    intervalRef.current = setInterval(()=> {
      setProgress (prev => {
        //to stop increment until it reaches 95%
        if (prev >=95) {
          clearInterval (intervalRef.current)
          return 95
        }
        return prev + (prev < 95 ? Math.floor(Math.random() * 10) : 1);
 
      });
    },2000)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);

      clearInterval(intervalRef.current);
      setProgress(100);

      setTimeout(() => {
        setIsLoading (false)
      },500)
    } catch (err: any) {
      alert("Error: " + err.message);
      clearInterval(intervalRef.current)
      setIsLoading(false);
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressButtonStyle ={
      background: `linear-gradient(to right, hsl(var(--primary)) ${progress}%, hsl(var(--primary-foreground)) 10%)`,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 bg-black">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Resume Analyzer</h1>
              <p className="text-gray-400">AI-powered resume analysis and optimization</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6 sticky top-8">
            <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Analysis Target</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={jobMode === "profile" ? "default" : "outline"}
                      onClick={() => setJobMode("profile")}
                      className="w-full flex items-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      Job Profile
                    </Button>
                    <Button
                      variant={jobMode === "description" ? "default" : "outline"}
                      onClick={() => setJobMode("description")}
                      className="w-full flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Custom Description
                    </Button>
                  </div>
                </div>

                {jobMode === "profile" ? (
                  <div className="space-y-2">
                    <Label htmlFor="job-profile" className="text-gray-300">Select Job Profile</Label>
                    <select
                      id="job-profile"
                      className="border p-2 rounded w-full bg-gray-800 border-gray-600 text-white"
                      value={selectedProfile}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                    >
                      {profiles.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="job-description" className="text-gray-300">Job Description</Label>
                    <Textarea
                      id="job-description"
                      rows={5}
                      placeholder="Paste job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[120px] resize-none bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Upload Your Resume</h2>
              <p className="text-gray-400 mb-4">Upload your PDF resume to get targeted analysis and improvement suggestions.</p>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="bg-gray-800 border-gray-600 text-white"
              />
              {/* <Button onClick={startAnalysis} disabled={isAnalyzing || !file} className="mt-4 w-full">
                {isAnalyzing ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </Button> */}
              <Button
                onClick={startAnalysis}
                disabled={isAnalyzing || !file}
                className="mt-4 w-full"
                // Apply the dynamic style only when analyzing
                style={isAnalyzing ? progressButtonStyle : {}}
              >
                {isAnalyzing ? (
                  <span className="flex items-center text-white-300">
                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                    {/* Update the text to show the progress percentage */}
                    Analyzing... {progress}%
                  </span>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </Button>
            </Card>
          </div>

          {analysisResult && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Overall Score</h3>
                  <div className={`text-3xl font-bold ${getScoreColor(analysisResult.score)}`}>
                    {analysisResult.score}/100
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${analysisResult.score}%` }}
                  />
                </div>
              </Card>

              <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-blue-400" />
                  Matching Qualifications
                </h3>
                <p className="text-sm text-gray-300">{analysisResult.analysis.matching_qualifications}</p>
              </Card>

              <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-yellow-400" />
                  Missing Requirements
                </h3>
                <p className="text-sm text-gray-300">{analysisResult.analysis.missing_requirements}</p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Improvements
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.analysis.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-400" />
                  Final Assessment
                </h3>
                <p className="text-sm font-bold text-blue-300">{analysisResult.analysis.final_assessment}</p>
              </Card>

              <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-400" />
                  Resume Suggestions
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Actionable feedback to improve your resume’s formatting, clarity, and keyword optimization.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Suggestions</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%] sm:max-w-4xl bg-gray-900 border border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Actionable Resume Suggestions</DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-invert max-h-[70vh] overflow-y-auto p-1 rounded-md">
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {analysisResult.suggestions}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>

              <Card className="p-6 bg-gray-900 border border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-400" />
                  Roadmap to 100%
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  A personalized plan to bridge skill gaps and achieve a perfect job match.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Roadmap</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%] sm:max-w-4xl bg-gray-900 border border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Roadmap to 100%</DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-invert max-h-[70vh] overflow-y-auto p-1 rounded-md">
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            // This will find all Markdown links and render them as <a> tags
                            // with your custom classes, without affecting any other text.
                            a: ({node, ...props}) => (
                              <a
                                className="text-blue-400 underline hover:text-blue-300"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {analysisResult.roadmap}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
