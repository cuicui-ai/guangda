export interface SpecialAccount {
  id: string;
  code: string;
  name: string;
  manager: string;
  department: string;
  strategyType: string;
  startDate: string;
  netAssetValue: number; // 资产净值 (亿)
  returnRate: number; // 收益率 (%) - Default (1y)
  volatility: number; // 波动率 (%) - Default (1y)
  maxDrawdown: number; // 最大回撤 (%) - Default (1y)
  benchmarkReturn: number; // 比较基准收益 (%)
  medianReturn: number; // 对照组中位数收益 (%)
  rank: number; // 排名 - Default (1y)
  totalAccounts: number; // 总账户数
  
  // Historical performance for curve comparison
  historicalPerformance: {
    date: string;
    accountReturn: number;
    benchmarkReturn: number;
  }[];
  
  // Multi-period data
  performance: {
    [key: string]: {
      returnRate: number;
      volatility: number;
      maxDrawdown: number;
      rank: number;
    }
  };
}

export interface StrategySummary {
  type: string;
  accountCount: number;
  totalSize: number; // 总规模 (亿)
  avgReturn: number;
  avgVolatility: number;
  avgMaxDrawdown: number;
  benchmarkName: string; // 比较基准名称
  medianReturn: number; // 对照组中位数收益
  medianVolatility: number; // 对照组中位数波动
  medianMaxDrawdown: number; // 对照组中位数回撤
  outperformCount: number; // 跑赢对照组数量
}

export interface DepartmentSummary {
  name: string;
  accountCount: number;
  totalSize: number;
  avgReturn: number;
  avgVolatility: number;
  avgMaxDrawdown: number;
  strategies: StrategySummary[];
}

export const MOCK_STRATEGIES = [
  "债权类-消金", "利率", "商品指数策略", "多资产宏观配置策略", 
  "宏观对冲", "定制类-存款", "定增", "股票多头", "转债", "量化", 
  "集合型-类货币", "集合类-权益"
];

const STRATEGY_BENCHMARKS: Record<string, string> = {
  "债权类-消金": "中债-综合财富指数",
  "利率": "利率债基金",
  "商品指数策略": "南华商品指数",
  "多资产宏观配置策略": "中证800指数",
  "宏观对冲": "混合债券型二级基金",
  "定制类-存款": "1年期定存利率",
  "定增": "普通股票型基金",
  "股票多头": "普通股票型基金",
  "转债": "可转换债券型基金",
  "量化": "中证500指数",
  "集合型-类货币": "中证货币基金指数",
  "集合类-权益": "沪深300指数"
};

export const MOCK_DEPARTMENTS = [
  "专户投资部", "创新资产部", "固定收益部", "现金管理部", "股票投资部"
];

// Generate some mock accounts
export const MOCK_ACCOUNTS: SpecialAccount[] = Array.from({ length: 50 }).map((_, i) => {
  const strategy = MOCK_STRATEGIES[Math.floor(Math.random() * MOCK_STRATEGIES.length)];
  const dept = MOCK_DEPARTMENTS[Math.floor(Math.random() * MOCK_DEPARTMENTS.length)];
  
  const periods = ['近一月', '近六月', '近一年', '近三年'];
  const performance: any = {};
  
  periods.forEach(p => {
    const baseReturn = p === '近一月' ? 1 : p === '近六月' ? 5 : p === '近一年' ? 10 : 25;
    performance[p] = {
      returnRate: parseFloat((Math.random() * baseReturn * 1.5 - baseReturn * 0.2).toFixed(2)),
      volatility: parseFloat((Math.random() * 8 + 2).toFixed(2)),
      maxDrawdown: parseFloat((Math.random() * 5).toFixed(2)),
      rank: Math.floor(Math.random() * 100) + 1
    };
  });

  const defaultPerf = performance['近一年'];

  // Generate historical performance
  const historicalPerformance = Array.from({ length: 12 }).map((_, j) => {
    const month = j + 1;
    const accountBase = (j + 1) * (Math.random() * 2 + 0.5);
    const benchmarkBase = (j + 1) * (Math.random() * 1.5 + 0.5);
    return {
      date: `2025-${month.toString().padStart(2, '0')}`,
      accountReturn: parseFloat(accountBase.toFixed(2)),
      benchmarkReturn: parseFloat(benchmarkBase.toFixed(2))
    };
  });

  return {
    id: `acc-${i}`,
    code: `88${String(i).padStart(4, '0')}`,
    name: `测试${i + 1}号 基金滨江${Math.floor(Math.random() * 100)}号`,
    manager: ["张三", "李四", "王五", "赵六"][Math.floor(Math.random() * 4)],
    department: dept,
    strategyType: strategy,
    startDate: `2022-${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}-01`,
    netAssetValue: Math.random() * 100 + 0.1,
    returnRate: defaultPerf.returnRate,
    volatility: defaultPerf.volatility,
    maxDrawdown: defaultPerf.maxDrawdown,
    benchmarkReturn: parseFloat((defaultPerf.returnRate - Math.random() * 2).toFixed(2)),
    medianReturn: parseFloat((defaultPerf.returnRate + (Math.random() - 0.5) * 3).toFixed(2)),
    rank: defaultPerf.rank,
    totalAccounts: 100,
    performance,
    historicalPerformance
  };
});

export const STRATEGY_SUMMARIES: StrategySummary[] = MOCK_STRATEGIES.map(type => {
  const accounts = MOCK_ACCOUNTS.filter(a => a.strategyType === type);
  return {
    type,
    accountCount: accounts.length,
    totalSize: accounts.reduce((sum, a) => sum + a.netAssetValue, 0),
    avgReturn: accounts.length ? accounts.reduce((sum, a) => sum + a.returnRate, 0) / accounts.length : 0,
    avgVolatility: accounts.length ? accounts.reduce((sum, a) => sum + a.volatility, 0) / accounts.length : 0,
    avgMaxDrawdown: accounts.length ? accounts.reduce((sum, a) => sum + a.maxDrawdown, 0) / accounts.length : 0,
    benchmarkName: STRATEGY_BENCHMARKS[type] || "中债-综合财富指数",
    medianReturn: 1.34,
    medianVolatility: 13.54,
    medianMaxDrawdown: 0.71,
    outperformCount: accounts.filter(a => a.returnRate > 1.34).length
  };
});

export const DEPARTMENT_SUMMARIES = MOCK_DEPARTMENTS.map(deptName => {
  const deptAccounts = MOCK_ACCOUNTS.filter(a => a.department === deptName);
  const strategiesInDept = Array.from(new Set(deptAccounts.map(a => a.strategyType)));
  
  const strategies = strategiesInDept.map(strategyType => {
    const accounts = deptAccounts.filter(a => a.strategyType === strategyType);
    return {
      type: strategyType,
      accountCount: accounts.length,
      totalSize: accounts.reduce((sum, a) => sum + a.netAssetValue, 0),
      avgReturn: accounts.length ? accounts.reduce((sum, a) => sum + a.returnRate, 0) / accounts.length : 0,
      avgVolatility: accounts.length ? accounts.reduce((sum, a) => sum + a.volatility, 0) / accounts.length : 0,
      avgMaxDrawdown: accounts.length ? accounts.reduce((sum, a) => sum + a.maxDrawdown, 0) / accounts.length : 0,
      benchmarkName: STRATEGY_BENCHMARKS[strategyType] || "中债-综合财富指数",
      medianReturn: 0.20,
      medianVolatility: 0.21,
      medianMaxDrawdown: 0.21,
      outperformCount: accounts.filter(a => a.returnRate > 0.20).length
    };
  });

  return {
    name: deptName,
    accountCount: deptAccounts.length,
    totalSize: deptAccounts.reduce((sum, a) => sum + a.netAssetValue, 0),
    avgReturn: deptAccounts.length ? deptAccounts.reduce((sum, a) => sum + a.returnRate, 0) / deptAccounts.length : 0,
    avgVolatility: deptAccounts.length ? deptAccounts.reduce((sum, a) => sum + a.volatility, 0) / deptAccounts.length : 0,
    avgMaxDrawdown: deptAccounts.length ? deptAccounts.reduce((sum, a) => sum + a.maxDrawdown, 0) / deptAccounts.length : 0,
    strategies
  };
});
