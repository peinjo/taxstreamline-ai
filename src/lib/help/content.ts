// Help center content - FAQs, guides, and documentation

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

export const faqCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: 'Rocket' },
  { id: 'tax-calculation', label: 'Tax Calculation', icon: 'Calculator' },
  { id: 'documents', label: 'Documents', icon: 'FileText' },
  { id: 'compliance', label: 'Compliance', icon: 'ShieldCheck' },
  { id: 'billing', label: 'Billing & Account', icon: 'CreditCard' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: 'AlertCircle' },
];

export const faqs: FAQItem[] = [
  // Getting Started
  {
    id: 'faq-1',
    question: 'How do I get started with the tax platform?',
    answer: 'After signing up, complete your profile with your business information. Then explore the dashboard to see your metrics, access the tax calculator, upload documents, and set up compliance tracking. We recommend taking the guided tour for a quick overview.',
    category: 'getting-started',
    tags: ['setup', 'beginner', 'onboarding'],
  },
  {
    id: 'faq-2',
    question: 'What information do I need to complete my profile?',
    answer: 'You\'ll need your business name, Tax Identification Number (TIN), business address, state of operation, and revenue band. This information helps us provide accurate tax calculations and compliance recommendations.',
    category: 'getting-started',
    tags: ['profile', 'tin', 'setup'],
  },
  {
    id: 'faq-3',
    question: 'Can I use the platform for multiple businesses?',
    answer: 'Currently, each account is designed for a single business entity. If you manage multiple businesses, you would need separate accounts for each. Contact support for enterprise solutions.',
    category: 'getting-started',
    tags: ['multiple', 'business', 'enterprise'],
  },
  
  // Tax Calculation
  {
    id: 'faq-4',
    question: 'What types of taxes can I calculate?',
    answer: 'Our platform supports Personal Income Tax (PAYE), Company Income Tax (CIT), Value Added Tax (VAT), Withholding Tax (WHT), Capital Gains Tax, and Stamp Duty calculations based on Nigerian tax laws.',
    category: 'tax-calculation',
    tags: ['paye', 'vat', 'cit', 'wht', 'tax types'],
  },
  {
    id: 'faq-5',
    question: 'How accurate are the tax calculations?',
    answer: 'Our calculations are based on the latest Nigerian tax regulations and are updated regularly. However, for complex tax situations or final filing amounts, we recommend consulting with a qualified tax professional.',
    category: 'tax-calculation',
    tags: ['accuracy', 'regulations', 'professional'],
  },
  {
    id: 'faq-6',
    question: 'Can I save and export my tax calculations?',
    answer: 'Yes! After calculating, you can export results as PDF for your records. All calculations are also saved in your account history for future reference.',
    category: 'tax-calculation',
    tags: ['export', 'pdf', 'save', 'history'],
  },
  
  // Documents
  {
    id: 'faq-7',
    question: 'What file types can I upload to the document vault?',
    answer: 'We support PDF, JPEG, PNG, Word documents (.doc, .docx), Excel spreadsheets (.xls, .xlsx), and common text formats. Maximum file size is 10MB per document.',
    category: 'documents',
    tags: ['upload', 'file types', 'pdf', 'excel'],
  },
  {
    id: 'faq-8',
    question: 'Are my documents secure?',
    answer: 'Yes, all documents are encrypted both in transit and at rest. We use bank-level security standards and your documents are only accessible by you and authorized team members.',
    category: 'documents',
    tags: ['security', 'encryption', 'privacy'],
  },
  {
    id: 'faq-9',
    question: 'How do I organize my documents?',
    answer: 'Documents are automatically categorized by type (receipts, filings, statements, reports). You can also add custom tags, search by name, and filter by tax year for easy organization.',
    category: 'documents',
    tags: ['organize', 'tags', 'search', 'filter'],
  },
  
  // Compliance
  {
    id: 'faq-10',
    question: 'What compliance requirements does the platform track?',
    answer: 'We track tax filing deadlines, regulatory compliance requirements, license renewals, and custom compliance items you add. You\'ll receive reminders before due dates.',
    category: 'compliance',
    tags: ['deadlines', 'reminders', 'tracking'],
  },
  {
    id: 'faq-11',
    question: 'How do I add a new compliance requirement?',
    answer: 'Go to the Compliance Tracker, click "Add New Requirement", fill in the details including title, due date, frequency, and priority. The system will automatically track and remind you.',
    category: 'compliance',
    tags: ['add', 'requirement', 'create'],
  },
  
  // Billing
  {
    id: 'faq-12',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit/debit cards, bank transfers, and popular Nigerian payment methods including Paystack and Flutterwave.',
    category: 'billing',
    tags: ['payment', 'cards', 'paystack'],
  },
  {
    id: 'faq-13',
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime from your account settings. Your access continues until the end of your billing period. Data is retained for 30 days after cancellation.',
    category: 'billing',
    tags: ['cancel', 'subscription', 'refund'],
  },
  
  // Troubleshooting
  {
    id: 'faq-14',
    question: 'Why can\'t I log in to my account?',
    answer: 'First, verify your email and password are correct. If you forgot your password, use the "Forgot Password" link. If issues persist, clear your browser cache or try a different browser.',
    category: 'troubleshooting',
    tags: ['login', 'password', 'access'],
  },
  {
    id: 'faq-15',
    question: 'My document upload is failing. What should I do?',
    answer: 'Check that your file is under 10MB and in a supported format. If the issue continues, try a different browser or contact support with the error message.',
    category: 'troubleshooting',
    tags: ['upload', 'error', 'file'],
  },
];

export const helpArticles: HelpArticle[] = [
  {
    id: 'article-1',
    title: 'Quick Start Guide',
    content: `
# Getting Started with TaxPro

Welcome to TaxPro! This guide will help you get up and running quickly.

## Step 1: Complete Your Profile
After signing up, navigate to Settings > Profile to enter your business details. This information is essential for accurate tax calculations.

## Step 2: Explore the Dashboard
Your dashboard shows key metrics including:
- Active clients
- Upcoming deadlines
- Pending documents
- Compliance alerts

## Step 3: Calculate Your First Tax
Go to Tax Web App, select your tax type, enter the required information, and click Calculate.

## Step 4: Upload Documents
Store all your tax-related documents securely in the Document Vault.

## Step 5: Set Up Notifications
Configure your notification preferences to receive reminders for important deadlines.
    `,
    category: 'getting-started',
    icon: 'BookOpen',
  },
  {
    id: 'article-2',
    title: 'Understanding Nigerian Tax Types',
    content: `
# Nigerian Tax Types Explained

## Personal Income Tax (PAYE)
Pay As You Earn tax is deducted from employee salaries. The rate is progressive, ranging from 7% to 24%.

## Company Income Tax (CIT)
Companies pay 30% of their taxable profits. Small companies with turnover below ₦25 million pay 0%.

## Value Added Tax (VAT)
A consumption tax of 7.5% on goods and services.

## Withholding Tax (WHT)
An advance payment of income tax deducted at source. Rates vary by transaction type.

## Capital Gains Tax
10% tax on gains from disposing of assets.
    `,
    category: 'tax-calculation',
    icon: 'FileText',
  },
];

// Search function for FAQs
export const searchFAQs = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery) ||
    faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// Get FAQs by category
export const getFAQsByCategory = (categoryId: string): FAQItem[] => {
  return faqs.filter(faq => faq.category === categoryId);
};

// Get article by ID
export const getArticleById = (articleId: string): HelpArticle | undefined => {
  return helpArticles.find(article => article.id === articleId);
};
