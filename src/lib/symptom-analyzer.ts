import * as tf from '@tensorflow/tfjs';
import nlp from 'compromise';

interface SymptomVector {
  symptom: string;
  vector: number[];
}

interface MLAnalysisResult {
  predictedConditions: Array<{ condition: string; confidence: number }>;
  severity: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

// Pre-trained symptom vectors (simplified for demo)
const symptomVectors: SymptomVector[] = [
  {
    symptom: 'severe headache with sensitivity to light',
    vector: [0.8, 0.6, 0.3, 0.9, 0.2]
  },
  {
    symptom: 'mild headache with neck pain',
    vector: [0.4, 0.3, 0.7, 0.2, 0.1]
  },
  // Add more symptom vectors
];

const conditionPatterns = {
  migraine: ['severe headache', 'light sensitivity', 'nausea'],
  flu: ['fever', 'body aches', 'fatigue', 'cough'],
  covid19: ['fever', 'dry cough', 'loss of taste', 'fatigue'],
  sinusitis: ['headache', 'facial pressure', 'nasal congestion'],
  anxiety: ['chest tightness', 'rapid heartbeat', 'sweating'],
};

export class SymptomAnalyzer {
  private model: tf.Sequential;

  constructor() {
    this.model = this.createModel();
  }

  private createModel(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 16, inputShape: [5], activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'softmax' }) // 3 severity levels
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private preprocessText(text: string): string[] {
    const doc = nlp(text.toLowerCase());
    doc.match('#Adjective #Noun').tag('Symptom');
    return doc.match('#Symptom').out('array');
  }

  private calculateSymptomVector(symptoms: string[]): number[] {
    const vector = new Array(5).fill(0);
    
    symptoms.forEach(symptom => {
      // Add intensity scoring
      if (symptom.includes('severe')) vector[0] += 0.8;
      if (symptom.includes('moderate')) vector[0] += 0.5;
      if (symptom.includes('mild')) vector[0] += 0.2;

      // Add duration impact
      if (symptom.includes('constant')) vector[1] += 0.9;
      if (symptom.includes('frequent')) vector[1] += 0.6;
      if (symptom.includes('occasional')) vector[1] += 0.3;

      // Add symptom type weights
      if (symptom.includes('pain')) vector[2] += 0.7;
      if (symptom.includes('fever')) vector[2] += 0.8;
      if (symptom.includes('cough')) vector[2] += 0.5;
    });

    return vector;
  }

  private async predictSeverity(vector: number[]): Promise<number> {
    const prediction = await this.model.predict(
      tf.tensor2d([vector])
    ) as tf.Tensor;
    
    const severityScores = await prediction.data();
    return Math.max(...Array.from(severityScores));
  }

  private matchConditions(symptoms: string[]): Array<{ condition: string; confidence: number }> {
    const matches: Array<{ condition: string; confidence: number }> = [];

    Object.entries(conditionPatterns).forEach(([condition, patterns]) => {
      let matchCount = 0;
      patterns.forEach(pattern => {
        if (symptoms.some(s => s.includes(pattern))) {
          matchCount++;
        }
      });
      
      const confidence = matchCount / patterns.length;
      if (confidence > 0.3) { // Minimum confidence threshold
        matches.push({ condition, confidence });
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  public async analyzeSymptoms(description: string): Promise<MLAnalysisResult> {
    const symptoms = this.preprocessText(description);
    const vector = this.calculateSymptomVector(symptoms);
    const severity = await this.predictSeverity(vector);
    const conditions = this.matchConditions(symptoms);

    return {
      predictedConditions: conditions,
      severity,
      urgencyLevel: severity > 0.7 ? 'high' : severity > 0.4 ? 'medium' : 'low'
    };
  }
}