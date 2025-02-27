import { SymptomAnalyzer } from './symptom-analyzer';

interface SymptomMatch {
  symptom: string;
  severity: number;
  relatedConditions: string[];
}

const symptomDictionary: Record<string, {
  keywords: string[];
  conditions: string[];
  severity: number;
}> = {
  headache: {
    keywords: ['headache', 'migraine', 'head pain', 'head pressure'],
    conditions: ['Tension Headache', 'Migraine', 'Stress'],
    severity: 2
  },
  fever: {
    keywords: ['fever', 'high temperature', 'hot', 'chills'],
    conditions: ['Flu', 'Infection', 'COVID-19'],
    severity: 3
  },
  cough: {
    keywords: ['cough', 'coughing', 'chest congestion'],
    conditions: ['Common Cold', 'Bronchitis', 'COVID-19'],
    severity: 2
  },
  fatigue: {
    keywords: ['tired', 'fatigue', 'exhausted', 'low energy'],
    conditions: ['Stress', 'Depression', 'Anemia'],
    severity: 1
  }
};

export async function analyzeSymptomText(text: string): Promise<SymptomMatch[]> {
  const analyzer = new SymptomAnalyzer();
  const mlAnalysis = await analyzer.analyzeSymptoms(text);
  const foundSymptoms: SymptomMatch[] = [];

  mlAnalysis.predictedConditions.forEach(({ condition, confidence }) => {
    if (confidence > 0.5) {
      foundSymptoms.push({
        symptom: condition,
        severity: Math.round(mlAnalysis.severity * 5),
        relatedConditions: [condition]
      });
    }
  });

  // Fallback to basic analysis if ML didn't find anything
  if (foundSymptoms.length === 0) {
    const lowercaseText = text.toLowerCase();
    Object.entries(symptomDictionary).forEach(([symptom, data]) => {
      const hasSymptom = data.keywords.some(keyword => 
        lowercaseText.includes(keyword.toLowerCase())
      );

      if (hasSymptom) {
        foundSymptoms.push({
          symptom,
          severity: data.severity,
          relatedConditions: data.conditions
        });
      }
    });
  }

  return foundSymptoms;
}

export function generateRecommendations(matches: SymptomMatch[]): string[] {
  const recommendations: string[] = [];
  const maxSeverity = Math.max(...matches.map(m => m.severity));

  if (maxSeverity >= 4) {
    recommendations.push("⚠️ Please seek immediate medical attention");
  }

  matches.forEach(match => {
    switch(match.symptom.toLowerCase()) {
      case 'fever':
        recommendations.push("🌡️ Monitor your temperature regularly");
        recommendations.push("💧 Stay hydrated and rest");
        break;
      case 'headache':
        recommendations.push("🏡 Rest in a quiet, dark room");
        recommendations.push("💊 Consider over-the-counter pain relievers");
        break;
      case 'cough':
        recommendations.push("🍯 Try honey and warm liquids");
        recommendations.push("💨 Use a humidifier if available");
        break;
      case 'migraine':
        recommendations.push("🌑 Stay in a dark, quiet room");
        recommendations.push("❄️ Apply cold compress to head or neck");
        break;
      case 'anxiety':
        recommendations.push("🧘‍♀️ Try deep breathing exercises");
        recommendations.push("🚶‍♀️ Take a short walk if possible");
        break;
    }
  });

  if (matches.length > 0) {
    recommendations.push("📝 Keep track of your symptoms");
    recommendations.push("👩‍⚕️ Consult your healthcare provider if symptoms persist");
  }

  return recommendations;
}