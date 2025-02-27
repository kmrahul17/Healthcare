import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Activity } from "lucide-react";
import { analyzeSymptomText, generateRecommendations } from "../lib/symptom-analysis";
interface AnalysisResult {
  symptoms: Array<{
    symptom: string;
    severity: number;
    relatedConditions: string[];
  }>;
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  shouldSeekCare: boolean;
}

const SymptomChecker = () => {
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const symptoms = await analyzeSymptomText(description);
      const recommendations = generateRecommendations(symptoms);
      
      setAnalysis({
        symptoms,
        recommendations,
        urgencyLevel: symptoms.some(s => s.severity >= 4) ? 'high' :
                     symptoms.some(s => s.severity >= 3) ? 'medium' : 'low',
        shouldSeekCare: symptoms.some(s => s.severity >= 4)
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Symptom Checker</h1>
          <p className="text-muted-foreground mt-2">
            Describe your symptoms in natural language and get instant analysis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Describe Your Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: I've had a severe headache for 2 days with some fever and fatigue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleAnalyze}
              className="w-full"
              disabled={!description.trim() || isAnalyzing}
            >
              <Activity className="mr-2 h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Detected Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.symptoms.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium capitalize">{item.symptom}</p>
                      <p className="text-sm text-muted-foreground">
                        Related conditions: {item.relatedConditions.join(", ")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.severity >= 4 ? "bg-red-100 text-red-700" :
                      item.severity >= 3 ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      Severity: {item.severity}/5
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`mb-4 p-4 rounded-lg border ${
                  analysis.urgencyLevel === 'high' ? 'bg-red-50 border-red-200' :
                  analysis.urgencyLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center">
                    <AlertCircle className={`h-5 w-5 mr-2 ${
                      analysis.urgencyLevel === 'high' ? 'text-red-500' :
                      analysis.urgencyLevel === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <div>
                      <h3 className="font-medium">Urgency Level: {analysis.urgencyLevel}</h3>
                      <p className="text-sm mt-1">
                        {analysis.shouldSeekCare 
                          ? "Please seek immediate medical attention"
                          : "Monitor your symptoms and follow the recommendations below"}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center">
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SymptomChecker;