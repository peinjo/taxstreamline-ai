import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Copy, Save, CheckCircle } from 'lucide-react';

interface GeneratedContent {
  content: string;
  type: string;
  confidence: number;
  suggestions: string[];
  sources: string[];
}

interface GeneratedContentDisplayProps {
  content: GeneratedContent | null;
  onCopyToClipboard: () => void;
  onDownload: () => void;
  onSaveToDocument: () => void;
  canSaveToDocument: boolean;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  content,
  onCopyToClipboard,
  onDownload,
  onSaveToDocument,
  canSaveToDocument
}) => {
  if (!content) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Generate content using the controls on the left to see results here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Content
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Confidence: {content.confidence}%
            </Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={onCopyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
              {canSaveToDocument && (
                <Button size="sm" variant="outline" onClick={onSaveToDocument}>
                  <Save className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose max-w-none">
          <div className="bg-muted/50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{content.content}</pre>
          </div>
        </div>

        {content.suggestions.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Suggestions for improvement:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {content.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {content.sources.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Sources:</h4>
            <div className="flex flex-wrap gap-2">
              {content.sources.map((source, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};