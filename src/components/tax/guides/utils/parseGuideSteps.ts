export interface GuideStep {
  id: string;
  number: number;
  title: string;
  content: string;
  subSteps: string[];
}

export function parseGuideSteps(markdownContent: string): GuideStep[] {
  const steps: GuideStep[] = [];
  
  // Split content by step headers (### Step X: or ## Step X:)
  const stepRegex = /(?:^|\n)#{2,3}\s*Step\s+(\d+):?\s*(.+?)(?=\n#{2,3}\s*Step\s+\d+|\n#{1,2}\s+[^#]|$)/gis;
  
  let match;
  while ((match = stepRegex.exec(markdownContent)) !== null) {
    const stepNumber = parseInt(match[1], 10);
    const titleAndContent = match[2].trim();
    
    // Split title from content (title is first line)
    const lines = titleAndContent.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Extract numbered sub-steps (1. xxx, 2. xxx, etc.)
    const subSteps: string[] = [];
    const subStepRegex = /^\d+\.\s+(.+)$/gm;
    let subMatch;
    while ((subMatch = subStepRegex.exec(content)) !== null) {
      subSteps.push(subMatch[1].trim());
    }
    
    steps.push({
      id: `step-${stepNumber}`,
      number: stepNumber,
      title,
      content,
      subSteps,
    });
  }
  
  // If no steps found with Step X format, try to split by any ### headers
  if (steps.length === 0) {
    const headerRegex = /(?:^|\n)###\s+(.+?)(?=\n###\s+|$)/gis;
    let headerMatch;
    let stepNum = 1;
    
    while ((headerMatch = headerRegex.exec(markdownContent)) !== null) {
      const fullContent = headerMatch[1].trim();
      const lines = fullContent.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      const subSteps: string[] = [];
      const subStepRegex = /^\d+\.\s+(.+)$/gm;
      let subMatch;
      while ((subMatch = subStepRegex.exec(content)) !== null) {
        subSteps.push(subMatch[1].trim());
      }
      
      steps.push({
        id: `step-${stepNum}`,
        number: stepNum,
        title,
        content,
        subSteps,
      });
      stepNum++;
    }
  }
  
  return steps;
}

export function calculateProgress(completedSteps: Set<string>, totalSteps: number): number {
  if (totalSteps === 0) return 0;
  return Math.round((completedSteps.size / totalSteps) * 100);
}
