import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentScannerProps {
  onScanComplete: (text: string, image: string) => void;
}

export const DocumentScanner = ({ onScanComplete }: DocumentScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const validateImage = async (imageSrc: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const minDimension = 500;
        if (img.width < minDimension || img.height < minDimension) {
          setError('Image is too small. Please use a larger or clearer image.');
          resolve(false);
        } else if (img.width * img.height > 12000000) {
          setError('Image is too large. Please use a smaller image.');
          resolve(false);
        }
        resolve(true);
      };
      img.onerror = () => {
        setError('Invalid image file');
        resolve(false);
      };
      img.src = imageSrc;
    });
  };

  const processImage = async (imageSrc: string) => {
    const isValid = await validateImage(imageSrc);
    if (!isValid) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        },
        workerPath: 'https://unpkg.com/tesseract.js@v4.1.1/dist/worker.min.js',
        corePath: 'https://unpkg.com/tesseract.js-core@v4.0.3/tesseract-core.wasm.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0'
      });

      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const { data } = await worker.recognize(imageSrc);
      
      await worker.terminate();
      onScanComplete(data.text, imageSrc);
      setIsOpen(false);
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      processImage(imageSrc);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please select a file under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      processImage(imageSrc);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Camera className="mr-2 h-4 w-4" />
          Scan Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Document</DialogTitle>
          <DialogDescription>
            Capture or upload a document to scan using OCR technology.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="camera">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" onClick={() => setIsCameraActive(true)}>
              Camera
            </TabsTrigger>
            <TabsTrigger value="upload" onClick={() => setIsCameraActive(false)}>
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-4">
            {isCameraActive && (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full"
                    videoConstraints={{
                      width: 720,
                      height: 480,
                      facingMode: "environment"
                    }}
                  />
                </div>
                <Button 
                  onClick={captureImage} 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  {isProcessing ? 'Processing...' : 'Capture'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  error ? 'border-destructive' : 'hover:border-primary'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Processing document... {progress}%
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center mt-2">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};