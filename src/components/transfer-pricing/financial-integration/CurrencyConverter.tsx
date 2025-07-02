import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DollarSign, RefreshCw, Calendar as CalendarIcon, TrendingUp, Info } from 'lucide-react';
import { format } from 'date-fns';

interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  date: string;
  source: string;
}

interface CurrencyConversion {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  date: string;
}

const MAJOR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' }
];

// Mock exchange rates (in practice, these would come from an API)
const MOCK_RATES: Record<string, Record<string, number>> = {
  'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0, 'CAD': 1.25, 'AUD': 1.35 },
  'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 129.5, 'CAD': 1.47, 'AUD': 1.59 },
  'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 150.7, 'CAD': 1.71, 'AUD': 1.85 }
};

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [conversions, setConversions] = useState<CurrencyConversion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock exchange rates data
    const mockRates: ExchangeRate[] = [
      { base: 'USD', target: 'EUR', rate: 0.85, date: '2024-01-15', source: 'Central Bank' },
      { base: 'USD', target: 'GBP', rate: 0.73, date: '2024-01-15', source: 'Central Bank' },
      { base: 'USD', target: 'JPY', rate: 110.0, date: '2024-01-15', source: 'Central Bank' },
      { base: 'EUR', target: 'USD', rate: 1.18, date: '2024-01-15', source: 'Central Bank' },
      { base: 'EUR', target: 'GBP', rate: 0.86, date: '2024-01-15', source: 'Central Bank' },
      { base: 'GBP', target: 'USD', rate: 1.37, date: '2024-01-15', source: 'Central Bank' }
    ];
    
    setExchangeRates(mockRates);
    setLoading(false);
  };

  const convertCurrency = () => {
    if (!amount || !fromCurrency || !toCurrency) return;

    const rate = getExchangeRate(fromCurrency, toCurrency);
    if (!rate) return;

    const numAmount = parseFloat(amount);
    const convertedAmount = numAmount * rate;

    const conversion: CurrencyConversion = {
      id: `conv_${Date.now()}`,
      fromCurrency,
      toCurrency,
      amount: numAmount,
      convertedAmount,
      rate,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    };

    setConversions(prev => [conversion, ...prev.slice(0, 9)]);
  };

  const getExchangeRate = (from: string, to: string): number | null => {
    if (from === to) return 1;
    
    // Check direct rate
    const directRate = MOCK_RATES[from]?.[to];
    if (directRate) return directRate;
    
    // Check inverse rate
    const inverseRate = MOCK_RATES[to]?.[from];
    if (inverseRate) return 1 / inverseRate;
    
    return null;
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const formatCurrency = (value: number, currency: string) => {
    const currencyInfo = MAJOR_CURRENCIES.find(c => c.code === currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const currentRate = getExchangeRate(fromCurrency, toCurrency);

  return (
    <div className="space-y-6">
      {/* Currency Converter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Conversion Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-currency">From</Label>
                <div className="flex gap-2">
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJOR_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={swapCurrencies}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-currency">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJOR_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Selection */}
            <div className="flex items-center gap-4">
              <Label>Exchange Rate Date:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Current Rate Display */}
            {currentRate && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Rate:</span>
                  <span className="font-medium">
                    1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
                  </span>
                </div>
              </div>
            )}

            {/* Convert Button */}
            <Button onClick={convertCurrency} className="w-full" disabled={!amount || !currentRate}>
              Convert
            </Button>

            {/* Conversion Result */}
            {conversions.length > 0 && (
              <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Converted Amount</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(conversions[0].convertedAmount, conversions[0].toCurrency)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatCurrency(conversions[0].amount, conversions[0].fromCurrency)} at rate {conversions[0].rate.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Exchange Rates</CardTitle>
            <Button variant="outline" onClick={fetchExchangeRates} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Rates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {exchangeRates.map((rate, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{rate.base}/{rate.target}</span>
                    <Badge variant="outline">{rate.source}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{rate.rate.toFixed(6)}</p>
                    <p className="text-sm text-muted-foreground">{rate.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Conversions */}
      {conversions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {formatCurrency(conversion.amount, conversion.fromCurrency)} → {formatCurrency(conversion.convertedAmount, conversion.toCurrency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rate: {conversion.rate.toFixed(6)} • {conversion.date}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-Currency Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Currency Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>OECD Guidelines:</strong> When conducting transfer pricing analysis across multiple currencies, 
              use consistent exchange rates and document the source and date of rates used. Consider using 
              average rates for the period rather than spot rates where appropriate.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-3">Rate Selection</h4>
              <ul className="text-sm space-y-1">
                <li>• Use central bank rates when available</li>
                <li>• Apply consistent rate sources</li>
                <li>• Document rate selection rationale</li>
                <li>• Consider period-end vs. average rates</li>
                <li>• Account for transaction timing</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Documentation</h4>
              <ul className="text-sm space-y-1">
                <li>• Record exchange rate sources</li>
                <li>• Maintain rate date documentation</li>
                <li>• Support functional currency selection</li>
                <li>• Document conversion methodology</li>
                <li>• Justify rate selection approach</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}