'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Calculator, Trophy, BarChart2 } from 'lucide-react';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BookOpen } from 'lucide-react';
import { useEffect } from 'react';

const Simulations = () => {
  const [coinFlips, setCoinFlips] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed] = useState(500);
  const [totalFlips, setTotalFlips] = useState(0);

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setCoinFlips(prev => {
      const newFlips = [...prev];
      const existingIndex = newFlips.findIndex(flip => flip.name === result);
      
      if (existingIndex >= 0) {
        newFlips[existingIndex] = {
          ...newFlips[existingIndex],
          count: newFlips[existingIndex].count + 1
        };
      } else {
        newFlips.push({ name: result, count: 1 });
      }
      
      return newFlips;
    });
    setTotalFlips(prev => prev + 1);
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(flipCoin, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, speed]);

  const calculateProbability = (result) => {
    const flip = coinFlips.find(f => f.name === result);
    if (!flip || totalFlips === 0) return 0;
    return ((flip.count / totalFlips) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coin Flip Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-64">
            <BarChart width={600} height={250} data={coinFlips}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current Probabilities</h3>
              <p>Heads: {calculateProbability('Heads')}%</p>
              <p>Tails: {calculateProbability('Tails')}%</p>
              <p className="mt-2">Total Flips: {totalFlips}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Law of Large Numbers</h3>
              <p>As we increase the number of flips, the probabilities tend to get closer to 50%.</p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? "Stop Simulation" : "Start Simulation"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setCoinFlips([]);
                setTotalFlips(0);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Distribution Generators
const generateNormalData = (mean, stdDev, sampleSize) => {
    const data = [];
    for (let x = mean - 4 * stdDev; x <= mean + 4 * stdDev; x += stdDev / 5) {
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      data.push({ x: x.toFixed(1), y: y * sampleSize });
    }
    return data;
  };

const generatePoissonData = (lambda, maxX) => {
  const data = [];
  for (let k = 0; k <= maxX; k++) {
    const p = (Math.pow(lambda, k) * Math.exp(-lambda)) / 
              Array.from({length: k}, (_, i) => i + 1).reduce((a, b) => a * b, 1);
    data.push({ x: k, y: p * 100 });
  }
  return data;
};

const generateBinomialData = (n, p) => {
  const data = [];
  for (let k = 0; k <= n; k++) {
    const coef = factorial(n) / (factorial(k) * factorial(n - k));
    const prob = coef * Math.pow(p, k) * Math.pow(1 - p, n - k);
    data.push({ x: k, y: prob * 100 });
  }
  return data;
};

const generateExponentialData = (lambda, maxX) => {
  const data = [];
  for (let x = 0; x <= maxX; x += 0.1) {
    const y = lambda * Math.exp(-lambda * x);
    data.push({ x: x.toFixed(1), y: y * 100 });
  }
  return data;
};

const generateChiSquaredData = (df, maxX) => {
  const data = [];
  for (let x = 0.1; x <= maxX; x += 0.1) {
    const y = Math.pow(x, (df/2)-1) * Math.exp(-x/2) / 
              (Math.pow(2, df/2) * gamma(df/2));
    data.push({ x: x.toFixed(1), y: y * 100 });
  }
  return data;
};

// Helper functions
const factorial = (n) => {
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
};

const gamma = (n) => {
  if (n === 1) return 1;
  if (n === 0.5) return Math.sqrt(Math.PI);
  return (n - 1) * gamma(n - 1);
};

// Components
const DistributionExplorer = () => {
  const [distribution, setDistribution] = useState('normal');
  const [params, setParams] = useState({
    mean: 50,
    stdDev: 10,
    lambda: 2,
    n: 10,
    p: 0.5,
    df: 3
  });

  const renderDistribution = () => {
    switch (distribution) {
      case 'normal':
        return {
          data: generateNormalData(params.mean, params.stdDev, 100),
          controls: (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Mean: {params.mean}</label>
                <Slider
                  value={[params.mean]}
                  onValueChange={(value) => setParams({...params, mean: value[0]})}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Standard Deviation: {params.stdDev}</label>
                <Slider
                  value={[params.stdDev]}
                  onValueChange={(value) => setParams({...params, stdDev: value[0]})}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
            </>
          )
        };
      case 'poisson':
        return {
          data: generatePoissonData(params.lambda, 15),
          controls: (
            <div>
              <label className="block text-sm font-medium mb-2">Lambda (λ): {params.lambda}</label>
              <Slider
                value={[params.lambda]}
                onValueChange={(value) => setParams({...params, lambda: value[0]})}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>
          )
        };
      case 'binomial':
        return {
          data: generateBinomialData(params.n, params.p),
          controls: (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Trials (n): {params.n}</label>
                <Slider
                  value={[params.n]}
                  onValueChange={(value) => setParams({...params, n: value[0]})}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Probability (p): {params.p}</label>
                <Slider
                  value={[params.p]}
                  onValueChange={(value) => setParams({...params, p: value[0]})}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </>
          )
        };
      case 'exponential':
        return {
          data: generateExponentialData(params.lambda, 10),
          controls: (
            <div>
              <label className="block text-sm font-medium mb-2">Rate (λ): {params.lambda}</label>
              <Slider
                value={[params.lambda]}
                onValueChange={(value) => setParams({...params, lambda: value[0]})}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          )
        };
      case 'chi-squared':
        return {
          data: generateChiSquaredData(params.df, 20),
          controls: (
            <div>
              <label className="block text-sm font-medium mb-2">Degrees of Freedom: {params.df}</label>
              <Slider
                value={[params.df]}
                onValueChange={(value) => setParams({...params, df: value[0]})}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          )
        };
      default:
        return { data: [], controls: null };
    }
  };

  const { data, controls } = renderDistribution();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution Explorer</CardTitle>
        <div className="flex space-x-2">
          {['normal', 'poisson', 'binomial', 'exponential', 'chi-squared'].map((dist) => (
            <Button
              key={dist}
              variant={distribution === dist ? "default" : "outline"}
              onClick={() => setDistribution(dist)}
              className="capitalize"
            >
              {dist}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64">
          <LineChart width={600} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#3b82f6" />
          </LineChart>
        </div>
        <div className="space-y-4">
          {controls}
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Distribution Properties</h3>
          {distribution === 'normal' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Symmetric bell-shaped curve</li>
              <li>68% of data within 1 standard deviation</li>
              <li>95% of data within 2 standard deviations</li>
              <li>99.7% of data within 3 standard deviations</li>
            </ul>
          )}
          {distribution === 'poisson' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Models rare events in fixed time/space intervals</li>
              <li>Mean equals variance (λ)</li>
              <li>Discrete distribution (whole numbers only)</li>
              <li>Right-skewed for small λ, more symmetric for large λ</li>
            </ul>
          )}
          {distribution === 'binomial' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Models success/failure experiments</li>
              <li>Mean = np, Variance = np(1-p)</li>
              <li>Discrete distribution</li>
              <li>Symmetric when p=0.5, skewed otherwise</li>
            </ul>
          )}
          {distribution === 'exponential' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Models time between events</li>
              <li>Memoryless property</li>
              <li>Mean = 1/λ</li>
              <li>Right-skewed distribution</li>
            </ul>
          )}
          {distribution === 'chi-squared' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Sum of squared standard normal variables</li>
              <li>Used in hypothesis testing</li>
              <li>Right-skewed distribution</li>
              <li>Mean equals degrees of freedom</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    {
      question: "If you flip a fair coin 3 times, what's the probability of getting all heads?",
      options: ["1/2", "1/4", "1/8", "1/6"],
      correct: 2,
      explanation: "For each flip, P(Heads) = 1/2. For all heads, multiply: (1/2) × (1/2) × (1/2) = 1/8"
    },
    {
      question: "What happens to the standard deviation when you multiply each data point by 2?",
      options: [
        "It stays the same",
        "It doubles",
        "It quadruples",
        "It's halved"
      ],
      correct: 1,
      explanation: "When you multiply all data points by a constant, the standard deviation is multiplied by the absolute value of that constant."
    },
    {
      question: "Which distribution is best suited for modeling the number of customers arriving at a store per hour?",
      options: [
        "Normal Distribution",
        "Poisson Distribution",
        "Exponential Distribution",
        "Binomial Distribution"
      ],
      correct: 1,
      explanation: "The Poisson distribution is ideal for modeling the number of events occurring in a fixed interval of time or space."
    },
    {
      question: "What is the mean of a binomial distribution with n=10 trials and p=0.3 probability of success?",
      options: ["3", "0.3", "7", "10"],
      correct: 0,
      explanation: "The mean of a binomial distribution is n×p = 10×0.3 = 3"
    },
    {
      question: "Which distribution is always right-skewed?",
      options: [
        "Normal Distribution",
        "Binomial Distribution",
        "Exponential Distribution",
        "Student's t-Distribution"
      ],
      correct: 2,
      explanation: "The exponential distribution is always right-skewed due to its nature of modeling waiting times or distances between events."
    }
  ];

  const handleAnswer = (answerIndex) => {
    if (!answered) {
      setSelectedAnswer(answerIndex);
      setAnswered(true);
      if (answerIndex === questions[currentQuestion].correct) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  if (showResult) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-xl mb-4">Your score: {score} out of {questions.length}</p>
          <p className="mb-4">
            ({((score / questions.length) * 100).toFixed(1)}%)
          </p>
          <Button onClick={resetQuiz}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Question {currentQuestion + 1} of {questions.length}</h2>
          <p className="text-lg">{questions[currentQuestion].question}</p>
        </div>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              variant={
                answered
                  ? index === questions[currentQuestion].correct
                    ? "default"
                    : index === selectedAnswer
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className="w-full justify-start text-left"
              onClick={() => handleAnswer(index)}
              disabled={answered}
            >
              {option}
            </Button>
          ))}
{answered && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-semibold">Explanation:</p>
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <div className="text-sm">Score: {score}/{currentQuestion + 1}</div>
          <Button onClick={handleNext} disabled={!answered}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const BasicConcepts = () => {
    const [step, setStep] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    const concepts = [
      {
        title: "What is a Mean?",
        simple: "The mean is like finding the 'center of gravity' of your data.",
        detailed: "Imagine you have five friends with different heights. If you add all their heights and divide by 5, you've found the average (mean) height. It's the 'balancing point' of all the values.",
        data: [
          { name: 'Person 1', value: 160 },
          { name: 'Person 2', value: 165 },
          { name: 'Person 3', value: 170 },
          { name: 'Person 4', value: 175 },
          { name: 'Person 5', value: 180 },
        ],
        interactive: "Try moving the bars to see how the mean changes!"
      },
      {
        title: "Understanding Variance",
        simple: "Variance shows how 'spread out' your data is from the mean.",
        detailed: "Think of variance like measuring how far people live from a central meeting point. Some might live very close, others far away. The bigger the variance, the more spread out everyone lives.",
        data: [
          { name: 'Dataset A', spread: 2 },
          { name: 'Dataset B', spread: 5 },
          { name: 'Dataset C', spread: 8 },
        ],
        interactive: "Adjust the spread to see how variance changes!"
      },
      {
        title: "Correlation",
        simple: "Correlation measures how two variables move together.",
        detailed: "Think of correlation like dancing partners. Perfect correlation (+1) means they move in perfect sync. No correlation (0) means they move randomly. Negative correlation (-1) means they move opposite to each other.",
        data: Array.from({length: 10}, (_, i) => ({
          x: i,
          positive: i * 1.5 + Math.random() * 2,
          negative: 10 - i * 1.2 + Math.random() * 2,
          none: Math.random() * 10
        }))
      }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>{concepts[step].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-lg">{concepts[step].simple}</p>
          </div>
          
          {showExplanation && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
              <p>{concepts[step].detailed}</p>
              
              <div className="h-64">
                {step === 2 ? (
                  <LineChart width={600} height={250} data={concepts[step].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="positive" stroke="#3b82f6" name="Positive Correlation" />
                    <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negative Correlation" />
                    <Line type="monotone" dataKey="none" stroke="#10b981" name="No Correlation" />
                  </LineChart>
                ) : (
                  <BarChart width={600} height={250} data={concepts[step].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={step === 0 ? "value" : "spread"} fill="#3b82f6" />
                  </BarChart>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </Button>
            
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={() => setStep(Math.min(concepts.length - 1, step + 1))}
                disabled={step === concepts.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

// Main App Component combining everything
const Home = () => {
  const [activeTab, setActiveTab] = useState('learn');

 

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold">Statistics Learning Hub</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 gap-4 bg-transparent">
            <TabsTrigger value="learn" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="distributions" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart2 className="mr-2 h-4 w-4" />
              Distributions
            </TabsTrigger>
            <TabsTrigger value="simulations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Calculator className="mr-2 h-4 w-4" />
              Simulations
            </TabsTrigger>
            <TabsTrigger value="quiz" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Trophy className="mr-2 h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-4">
            <BasicConcepts />
          </TabsContent>
          <TabsContent value="distributions" className="space-y-4">
            <DistributionExplorer />
          </TabsContent>
          <TabsContent value="simulations" className="space-y-4">
            <Simulations />
          </TabsContent>
          <TabsContent value="quiz" className="space-y-4">
            <Quiz />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Built by your AI professor
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;