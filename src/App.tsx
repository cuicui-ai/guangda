/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  BarChart3, 
  LineChart as LineChartIcon, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  Download,
  Bell,
  User,
  Menu,
  TrendingUp,
  AlertCircle,
  Briefcase,
  X,
  RefreshCw,
  ArrowUpRight,
  Plus,
  Minus
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line, ComposedChart, Area, Cell,
  ReferenceLine, Label
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  MOCK_ACCOUNTS, 
  MOCK_STRATEGIES, 
  MOCK_DEPARTMENTS, 
  STRATEGY_SUMMARIES,
  DEPARTMENT_SUMMARIES,
  SpecialAccount 
} from './data';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group",
      active ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={cn(active ? "text-purple-700" : "text-gray-400 group-hover:text-gray-600")} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {active && <div className="w-1 h-4 bg-purple-600 rounded-full" />}
  </div>
);

const FilterBadge = ({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void, [key: string]: any }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-3 py-1 rounded-md text-xs font-medium transition-all",
      active ? "bg-purple-700 text-white" : "text-gray-500 hover:bg-gray-100"
    )}
  >
    {label}
  </button>
);

const Sparkline = ({ data }: { data: number[] }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((val - min) / range) * 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="20" className="overflow-visible">
      <polyline
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const StatCard = ({ label, value, unit, trend }: { label: string, value: string | number, unit?: string, trend?: number }) => {
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-gray-900">{displayValue}</span>
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={cn("text-[10px] mt-1 font-medium", trend >= 0 ? "text-green-500" : "text-red-500")}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(2)}%
        </div>
      )}
    </div>
  );
};

const AccountDetailModal = ({ account, isOpen, onClose }: { account: SpecialAccount | null, isOpen: boolean, onClose: () => void }) => {
  if (!account) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 space-y-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{account.name}</h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{account.code}</span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><User size={14} /> 经理: {account.manager}</span>
                  <span className="flex items-center gap-1"><Briefcase size={14} /> 部门: {account.department}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={14} /> 策略: {account.strategyType}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="资产净值" value={account.netAssetValue} unit="亿" />
              <StatCard label="收益率" value={account.returnRate} unit="%" trend={2.4} />
              <StatCard label="波动率" value={account.volatility} unit="%" trend={-0.5} />
              <StatCard label="最大回撤" value={account.maxDrawdown} unit="%" trend={-1.2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">收益率曲线对比</h4>
                  <div className="flex gap-4 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> 专户收益</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-gray-400"></span> 业绩基准</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={account.historicalPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} unit="%" label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                <div className="font-bold mb-1 text-gray-900">{payload[0].payload.date}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  <span className="text-gray-400">专户收益:</span> <span className="font-mono text-purple-600 font-bold">{payload[0].value?.toFixed(2)}%</span>
                                  <span className="text-gray-400">业绩基准:</span> <span className="font-mono text-gray-500">{payload[1].value?.toFixed(2)}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="accountReturn" name="专户收益" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="benchmarkReturn" name="业绩基准" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">近期收益热力图</h4>
                <div className="space-y-3">
                  {[
                    { label: '近1周', val: 1.2 },
                    { label: '近1月', val: 3.5 },
                    { label: '近3月', val: 5.8 },
                    { label: '近6月', val: 8.2 },
                    { label: '近1年', val: 12.4 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-xs font-medium text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white",
                          item.val > 10 ? "bg-green-700" : item.val > 5 ? "bg-green-600" : item.val > 0 ? "bg-green-400" : "bg-red-400"
                        )}>
                          {item.val.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [activeModule, setActiveModule] = useState('委外资管');
  const [activeSubModule, setActiveSubModule] = useState('专户业绩');
  const [activeTab, setActiveTab] = useState<'list' | 'strategy' | 'dept'>('list');
  const [selectedPeriod, setSelectedPeriod] = useState('近一年');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedAccount, setSelectedAccount] = useState<SpecialAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'analysis'>('list');

  // Data Sync State
  const [syncTab, setSyncTab] = useState<'product' | 'netValue'>('product');

  const handleAccountClick = (account: SpecialAccount) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('全部');
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  // Chart-specific filters
  const [chart1Strategy, setChart1Strategy] = useState('全部');
  const [chart3Strategy, setChart3Strategy] = useState('全部');
  const [chart4Strategy, setChart4Strategy] = useState('全部');
  const [chart5Strategy, setChart5Strategy] = useState('全部');
  const [chart6Dimension, setChart6Dimension] = useState<'strategy' | 'dept'>('strategy');

  const toggleStrategyExpansion = (strategyType: string) => {
    const newExpanded = new Set(expandedStrategies);
    if (newExpanded.has(strategyType)) {
      newExpanded.delete(strategyType);
    } else {
      newExpanded.add(strategyType);
    }
    setExpandedStrategies(newExpanded);
  };

  const toggleDepartmentExpansion = (deptName: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(deptName)) {
      newExpanded.delete(deptName);
    } else {
      newExpanded.add(deptName);
    }
    setExpandedDepartments(newExpanded);
  };

  const filteredAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter(acc => {
      const matchesSearch = acc.name.includes(searchQuery) || acc.code.includes(searchQuery);
      const matchesStrategy = selectedStrategy === '全部' || acc.strategyType === selectedStrategy;
      return matchesSearch && matchesStrategy;
    });
  }, [searchQuery, selectedStrategy]);

  // Dynamic Summaries based on selectedPeriod
  const strategySummaries = useMemo(() => {
    return MOCK_STRATEGIES.map(type => {
      const accounts = MOCK_ACCOUNTS.filter(a => a.strategyType === type);
      const perfData = accounts.map(a => a.performance[selectedPeriod] || a.performance['近一年']);
      
      return {
        type,
        accountCount: accounts.length,
        totalSize: accounts.reduce((sum, a) => sum + a.netAssetValue, 0),
        avgReturn: perfData.length ? perfData.reduce((sum, p) => sum + p.returnRate, 0) / perfData.length : 0,
        avgVolatility: perfData.length ? perfData.reduce((sum, p) => sum + p.volatility, 0) / perfData.length : 0,
        avgMaxDrawdown: perfData.length ? perfData.reduce((sum, p) => sum + p.maxDrawdown, 0) / perfData.length : 0,
        benchmarkName: "中债-综合财富指数",
        medianReturn: 1.34,
        medianVolatility: 13.54,
        medianMaxDrawdown: 0.71,
        outperformCount: perfData.filter(p => p.returnRate > 1.34).length
      };
    });
  }, [selectedPeriod]);

  const departmentSummaries = useMemo(() => {
    return MOCK_DEPARTMENTS.map(deptName => {
      const deptAccounts = MOCK_ACCOUNTS.filter(a => a.department === deptName);
      const strategiesInDept = Array.from(new Set(deptAccounts.map(a => a.strategyType)));
      
      const strategies = strategiesInDept.map(strategyType => {
        const accounts = deptAccounts.filter(a => a.strategyType === strategyType);
        const perfData = accounts.map(a => a.performance[selectedPeriod] || a.performance['近一年']);
        
        return {
          type: strategyType,
          accountCount: accounts.length,
          totalSize: accounts.reduce((sum, a) => sum + a.netAssetValue, 0),
          avgReturn: perfData.length ? perfData.reduce((sum, p) => sum + p.returnRate, 0) / perfData.length : 0,
          avgVolatility: perfData.length ? perfData.reduce((sum, p) => sum + p.volatility, 0) / perfData.length : 0,
          avgMaxDrawdown: perfData.length ? perfData.reduce((sum, p) => sum + p.maxDrawdown, 0) / perfData.length : 0,
          benchmarkName: "中债-综合财富指数",
          medianReturn: 0.20,
          medianVolatility: 0.21,
          medianMaxDrawdown: 0.21,
          outperformCount: perfData.filter(p => p.returnRate > 0.20).length
        };
      });

      const deptPerfData = deptAccounts.map(a => a.performance[selectedPeriod] || a.performance['近一年']);

      return {
        name: deptName,
        accountCount: deptAccounts.length,
        totalSize: deptAccounts.reduce((sum, a) => sum + a.netAssetValue, 0),
        avgReturn: deptPerfData.length ? deptPerfData.reduce((sum, p) => sum + p.returnRate, 0) / deptPerfData.length : 0,
        avgVolatility: deptPerfData.length ? deptPerfData.reduce((sum, p) => sum + p.volatility, 0) / deptPerfData.length : 0,
        avgMaxDrawdown: deptPerfData.length ? deptPerfData.reduce((sum, p) => sum + p.maxDrawdown, 0) / deptPerfData.length : 0,
        strategies
      };
    });
  }, [selectedPeriod]);

  // Chart 1 Data: Scatter Plot
  const scatterData = useMemo(() => {
    const accounts = MOCK_ACCOUNTS.filter(acc => chart1Strategy === '全部' || acc.strategyType === chart1Strategy);
    return accounts.map(acc => {
      const perf = acc.performance[selectedPeriod] || acc.performance['近一年'];
      return {
        id: acc.id,
        name: acc.name,
        x: perf.volatility,
        y: perf.returnRate,
        z: acc.netAssetValue,
        strategy: acc.strategyType
      };
    });
  }, [selectedPeriod, chart1Strategy]);

  // Chart 2 Data: Outperformance
  const outperformanceData = useMemo(() => strategySummaries.slice(0, 5).map(s => ({
    name: s.type.substring(0, 4),
    win: s.outperformCount,
    loss: s.accountCount - s.outperformCount
  })), [strategySummaries]);

  // Chart 3 Data: Trend line
  const trendData = useMemo(() => {
    // Mocking trend data based on selected strategy and period
    const baseValue = selectedPeriod === '近一月' ? 1 : selectedPeriod === '近六月' ? 5 : selectedPeriod === '近一年' ? 10 : 25;
    const points = selectedPeriod === '近一月' ? 4 : selectedPeriod === '近六月' ? 6 : selectedPeriod === '近一年' ? 12 : 12;
    
    return Array.from({ length: points }).map((_, i) => ({
      name: `T-${points - i}`,
      value: parseFloat((baseValue * (i / points) + Math.random() * 2).toFixed(2)),
      median: parseFloat((baseValue * (i / points) * 0.9 + Math.random() * 1.5).toFixed(2))
    }));
  }, [selectedPeriod, chart3Strategy]);

  // Chart 4 Data: Rank Histogram
  const histogramData = useMemo(() => {
    const accounts = MOCK_ACCOUNTS.filter(acc => chart4Strategy === '全部' || acc.strategyType === chart4Strategy);
    const N = accounts.length;
    if (N === 0) return [];

    const ranks = accounts.map(acc => (acc.performance[selectedPeriod] || acc.performance['近一年']).rank).sort((a, b) => a - b);
    
    const intervals = [
      { label: '前10%', max: Math.ceil(N * 0.1) },
      { label: '10%-25%', max: Math.ceil(N * 0.25) },
      { label: '25%-50%', max: Math.ceil(N * 0.5) },
      { label: '50%-75%', max: Math.ceil(N * 0.75) },
      { label: '75%-90%', max: Math.ceil(N * 0.9) },
      { label: '后10%', max: N }
    ];

    const counts = intervals.map((interval, i) => {
      const min = i === 0 ? 0 : intervals[i-1].max;
      const count = ranks.filter(r => r > min && r <= interval.max).length;
      return {
        range: interval.label,
        count,
        percentage: parseFloat(((count / N) * 100).toFixed(2))
      };
    });

    return counts;
  }, [selectedPeriod, chart4Strategy]);

  // Chart 5 Data: Bubble Chart
  const bubbleData = useMemo(() => {
    const accounts = MOCK_ACCOUNTS.filter(acc => chart5Strategy === '全部' || acc.strategyType === chart5Strategy);
    return accounts.map(acc => {
      const perf = acc.performance[selectedPeriod] || acc.performance['近一年'];
      return {
        id: acc.id,
        name: acc.name,
        x: acc.netAssetValue,
        y: perf.returnRate,
        z: perf.volatility, // Bubble size mapped to volatility
        strategy: acc.strategyType
      };
    });
  }, [selectedPeriod, chart5Strategy]);

  // Chart 6 Data: Waterfall / Contribution
  const contributionData = useMemo(() => {
    let groups: any[] = [];
    if (chart6Dimension === 'strategy') {
      groups = strategySummaries.map(s => ({
        name: s.type,
        size: s.totalSize,
        return: s.avgReturn
      }));
    } else {
      groups = departmentSummaries.map(d => ({
        name: d.name,
        size: d.totalSize,
        return: d.avgReturn
      }));
    }

    const totalSize = groups.reduce((sum, g) => sum + g.size, 0);
    const contributions = groups.map(g => ({
      name: g.name,
      contribution: parseFloat(((g.size / totalSize) * g.return).toFixed(2)),
      size: g.size,
      return: g.return
    }));

    // Sort by absolute contribution descending
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    const waterfall: any[] = [];
    let cumulative = 0;
    contributions.forEach(c => {
      waterfall.push({
        name: c.name,
        value: parseFloat(c.contribution.toFixed(2)),
        start: cumulative,
        end: cumulative + c.contribution,
        size: c.size,
        return: c.return
      });
      cumulative += c.contribution;
    });

    waterfall.push({
      name: '总加权收益',
      value: parseFloat(cumulative.toFixed(2)),
      isTotal: true
    });

    return waterfall;
  }, [chart6Dimension, selectedPeriod]);

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#e11d48] rounded flex items-center justify-center text-white font-bold">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div>
          <h1 className="font-bold text-sm tracking-tight text-[#4c0519]">光大FOF投研平台</h1>
        </div>
        
        <nav className="flex-1 py-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="模拟组合test" 
            active={activeModule === '模拟组合test'} 
            onClick={() => setActiveModule('模拟组合test')} 
          />
          <SidebarItem 
            icon={Briefcase} 
            label="基金产品" 
            active={activeModule === '基金产品'} 
            onClick={() => setActiveModule('基金产品')} 
          />
          <SidebarItem 
            icon={PieChart} 
            label="基金池" 
            active={activeModule === '基金池'} 
            onClick={() => setActiveModule('基金池')} 
          />
          <SidebarItem 
            icon={User} 
            label="基金经理" 
            active={activeModule === '基金经理'} 
            onClick={() => setActiveModule('基金经理')} 
          />
          <SidebarItem 
            icon={Briefcase} 
            label="入池管理" 
            active={activeModule === '入池管理'} 
            onClick={() => setActiveModule('入池管理')} 
          />
          <SidebarItem 
            icon={AlertCircle} 
            label="风控设置" 
            active={activeModule === '风控设置'} 
            onClick={() => setActiveModule('风控设置')} 
          />
          <SidebarItem 
            icon={LayoutDashboard} 
            label="系统管理" 
            active={activeModule === '系统管理'} 
            onClick={() => setActiveModule('系统管理')} 
          />
          <SidebarItem 
            icon={Briefcase} 
            label="权限申请" 
            active={activeModule === '权限申请'} 
            onClick={() => setActiveModule('权限申请')} 
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="委外资管" 
            active={activeModule === '委外资管'} 
            onClick={() => setActiveModule('委外资管')} 
          />
          {activeModule === '委外资管' && (
            <div className="bg-gray-50/50 py-1">
              {['委外产品', '专户业绩', '数据同步'].map(sub => (
                <div 
                  key={sub}
                  onClick={() => setActiveSubModule(sub)}
                  className={cn(
                    "pl-12 pr-4 py-2 cursor-pointer text-xs transition-colors",
                    activeSubModule === sub ? "text-purple-700 font-bold" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {sub}
                </div>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 h-full">
            <div className="flex items-center px-4 h-full text-xs text-gray-400 font-medium border-r border-gray-100">
              首页
            </div>
            <div className="flex items-center gap-2 px-4 h-full bg-purple-50 text-purple-700 text-xs font-bold border-r border-gray-100 relative">
              业绩分析
              <button className="text-purple-300 hover:text-purple-500">
                <AlertCircle size={10} className="rotate-45" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="基金代码/基金名称/基金经理" 
                className="w-64 pl-4 pr-10 py-1.5 bg-gray-100 border-none rounded-full text-[11px] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell size={18} className="text-gray-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center border-2 border-white">12</span>
              </div>
              <AlertCircle size={18} className="text-gray-400" />
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <User size={18} className="text-gray-400" />
                <span>张三</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeModule === '委外资管' && activeSubModule === '专户业绩' ? (
            <>
              {/* Filters & Tabs */}
              <section className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex bg-white p-1 rounded border border-gray-200">
                    {['近一周', '近一月', '近三月', '近六月', '近一年', '近三年', '成立以来'].map(p => (
                      <FilterBadge key={p} label={p} active={selectedPeriod === p} onClick={() => setSelectedPeriod(p)} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-gray-200">
                    <span className="text-[10px] text-gray-400">自定义:</span>
                    <input 
                      type="date" 
                      className="text-[10px] border-none outline-none bg-transparent" 
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                      type="date" 
                      className="text-[10px] border-none outline-none bg-transparent" 
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {viewMode === 'list' ? (
                    <div className="flex items-center gap-8">
                      {(['list', 'strategy', 'dept'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "pb-2 text-xs font-bold transition-all border-b-2",
                            activeTab === tab ? "text-purple-700 border-purple-700" : "text-gray-400 border-transparent hover:text-gray-600"
                          )}
                        >
                          {tab === 'list' ? '专户列表' : tab === 'strategy' ? '策略汇总' : '部门策略汇总'}
                        </button>
                      ))}
                    </div>
                  ) : <div />}

                  <div className="flex bg-white p-1 rounded border border-gray-200">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded transition-all",
                        viewMode === 'list' ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      列表展示
                    </button>
                    <button
                      onClick={() => setViewMode('analysis')}
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded transition-all",
                        viewMode === 'analysis' ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      业绩分析
                    </button>
                  </div>
                </div>

                {viewMode === 'list' && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">专户名称:</span>
                      <input 
                        type="text" 
                        placeholder="请输入专户名称/代码/资产编码" 
                        className="w-64 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none focus:border-purple-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button className="px-6 py-1.5 bg-orange-500 text-white text-xs font-bold rounded">查询</button>
                    </div>
                    <button className="px-6 py-1.5 bg-orange-500 text-white text-xs font-bold rounded">导出</button>
                  </div>
                )}
              </section>

              {/* Content Section */}
              {viewMode === 'list' ? (
                /* Table Section */
                <section className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      {activeTab === 'list' ? (
                        <>
                          <tr className="bg-[#f3e8ff]/30 border-b border-gray-100">
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户资产编码</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户代码</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户名称</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">管理人</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户管理部门</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">策略类型</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">成立日期</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-right">资产净值 (元)</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center">业绩走势</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colSpan={3}>业绩走势</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100">比较基准/对照组</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colSpan={3}>对照组中位数</th>
                          </tr>
                          <tr className="bg-[#f3e8ff]/10 border-b border-gray-100">
                            <th colSpan={9} />
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">可转换债券型基金</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤</th>
                          </tr>
                        </>
                      ) : activeTab === 'strategy' ? (
                        <>
                          <tr className="bg-[#f3e8ff]/30 border-b border-gray-100">
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">策略类型</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center">专户数量</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-right">总规模(亿)</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colSpan={3}>业绩走势</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100">比较基准/对照组</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colSpan={4}>对照组中位数</th>
                          </tr>
                          <tr className="bg-[#f3e8ff]/10 border-b border-gray-100">
                            <th colSpan={3} />
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100" />
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">XX周期内跑赢对照组中位数数量</th>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="bg-[#f3e8ff]/30 border-b border-gray-100">
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户管理部门</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60">策略类型</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center">专户数量</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-right">总规模(亿)</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colSpan={3}>业绩走势</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100">比较基准/对照组</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colSpan={4}>对照组中位数</th>
                          </tr>
                          <tr className="bg-[#f3e8ff]/10 border-b border-gray-100">
                            <th colSpan={4} />
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100" />
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                            <th className="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">XX周期内跑赢对照组中位数数量</th>
                          </tr>
                        </>
                      )}
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeTab === 'list' ? (
                        filteredAccounts.slice(0, 15).map((acc) => {
                          const perf = acc.performance[selectedPeriod] || acc.performance['近一年'];
                          return (
                            <tr 
                              key={acc.id} 
                              onClick={() => handleAccountClick(acc)}
                              className={cn(
                                "hover:bg-purple-50/30 cursor-pointer transition-colors group",
                                selectedAccount?.id === acc.id ? "bg-purple-50" : ""
                              )}
                            >
                              <td className="px-4 py-3 text-[11px] font-mono text-gray-500">{acc.code}</td>
                              <td className="px-4 py-3 text-[11px] font-mono text-gray-500">{acc.code}</td>
                              <td className="px-4 py-3 text-[11px] font-bold text-gray-700">{acc.name}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-600">国泰基金管理有限公司</td>
                              <td className="px-4 py-3 text-[11px] text-gray-600">{acc.department}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-600">{acc.strategyType}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-500">2022-06-30</td>
                              <td className="px-4 py-3 text-[11px] font-bold text-right text-gray-700">{acc.netAssetValue.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                <Sparkline data={[10, 15, 8, 12, 20, 15, 25]} />
                              </td>
                              <td className="px-4 py-3 text-[11px] font-bold text-center text-gray-700 border-l border-gray-50">{perf.returnRate.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{perf.volatility.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{perf.maxDrawdown.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-500 text-center border-l border-gray-50">可转换债券型基金</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600 border-l border-gray-50">1.34</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">13.54</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">0.71</td>
                            </tr>
                          );
                        })
                      ) : activeTab === 'strategy' ? (
                        strategySummaries.map((summary) => (
                          <React.Fragment key={summary.type}>
                            <tr 
                              onClick={() => toggleStrategyExpansion(summary.type)}
                              className="hover:bg-purple-50/30 cursor-pointer transition-colors group bg-gray-50/30"
                            >
                              <td className="px-4 py-3 text-[11px] font-bold text-gray-700 flex items-center gap-2">
                                {expandedStrategies.has(summary.type) ? <ChevronDown size={14} className="text-purple-600" /> : <ChevronRight size={14} className="text-gray-400" />}
                                {summary.type}
                              </td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{summary.accountCount}</td>
                              <td className="px-4 py-3 text-[11px] font-bold text-right text-gray-700">{summary.totalSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-[11px] font-bold text-center text-gray-700 border-l border-gray-50">{summary.avgReturn.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{summary.avgVolatility.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{summary.avgMaxDrawdown.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-500 text-center border-l border-gray-50">{summary.benchmarkName}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600 border-l border-gray-50">{summary.medianReturn.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{summary.medianVolatility.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{summary.medianMaxDrawdown.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{summary.outperformCount}</td>
                            </tr>
                            {expandedStrategies.has(summary.type) && (
                              MOCK_ACCOUNTS.filter(acc => acc.strategyType === summary.type).map(acc => {
                                const perf = acc.performance[selectedPeriod] || acc.performance['近一年'];
                                return (
                                  <tr 
                                    key={acc.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAccountClick(acc);
                                    }}
                                    className={cn(
                                      "hover:bg-purple-50/20 cursor-pointer transition-colors group",
                                      selectedAccount?.id === acc.id ? "bg-purple-50/50" : ""
                                    )}
                                  >
                                    <td className="px-8 py-2 text-[10px] text-gray-500 italic">{acc.name}</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400">-</td>
                                    <td className="px-4 py-2 text-[10px] text-right text-gray-500">{acc.netAssetValue.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-500 border-l border-gray-50">{perf.returnRate.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400">{perf.volatility.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400">{perf.maxDrawdown.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400 border-l border-gray-50">-</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400 border-l border-gray-50">-</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400">-</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400">-</td>
                                    <td className="px-4 py-2 text-[10px] text-center text-gray-400">-</td>
                                  </tr>
                                );
                              })
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        departmentSummaries.map((dept) => (
                          <React.Fragment key={dept.name}>
                            <tr 
                              onClick={() => toggleDepartmentExpansion(dept.name)}
                              className="hover:bg-purple-50/30 cursor-pointer transition-colors group bg-gray-100/50"
                            >
                              <td className="px-4 py-3 text-[11px] font-bold text-gray-900 flex items-center gap-2">
                                {expandedDepartments.has(dept.name) ? <ChevronDown size={14} className="text-purple-600" /> : <ChevronRight size={14} className="text-gray-400" />}
                                {dept.name}
                              </td>
                              <td className="px-4 py-3 text-[11px] text-gray-400">-</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{dept.accountCount}</td>
                              <td className="px-4 py-3 text-[11px] font-bold text-right text-gray-700">{dept.totalSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-[11px] font-bold text-center text-gray-700 border-l border-gray-50">{dept.avgReturn.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{dept.avgVolatility.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{dept.avgMaxDrawdown.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-400 text-center border-l border-gray-50">-</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600 border-l border-gray-50">{dept.avgReturn.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{dept.avgVolatility.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-600">{dept.avgMaxDrawdown.toFixed(2)}</td>
                              <td className="px-4 py-3 text-[11px] text-center text-gray-400">-</td>
                            </tr>
                            {expandedDepartments.has(dept.name) && (
                              dept.strategies.map(strategy => (
                                <tr 
                                  key={strategy.type}
                                  className="hover:bg-purple-50/20 transition-colors group bg-white"
                                >
                                  <td className="px-8 py-2 text-[10px] text-gray-400 italic">{dept.name}</td>
                                  <td className="px-4 py-2 text-[10px] text-gray-600">{strategy.type}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-500">{strategy.accountCount}</td>
                                  <td className="px-4 py-2 text-[10px] text-right text-gray-500">{strategy.totalSize.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-500 border-l border-gray-50">{strategy.avgReturn.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-400">{strategy.avgVolatility.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-400">{strategy.avgMaxDrawdown.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-500 border-l border-gray-50">{strategy.benchmarkName}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-400 border-l border-gray-50">{strategy.medianReturn.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-400">{strategy.medianVolatility.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-400">{strategy.medianMaxDrawdown.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-[10px] text-center text-gray-400">{strategy.outperformCount}</td>
                                </tr>
                              ))
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {activeTab === 'list' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">显示 1-10 条，共 {filteredAccounts.length} 条</span>
                    <div className="flex gap-2">
                      <button className="p-1 rounded hover:bg-gray-200 text-gray-400"><Menu size={14} /></button>
                      <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">上一页</button>
                      <button className="px-3 py-1 bg-orange-600 text-white rounded text-xs font-medium">1</button>
                      <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">2</button>
                      <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">下一页</button>
                    </div>
                  </div>
                )}
              </section>
              ) : (
                /* Visualization Dashboard */
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Return-Risk Scatter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <PieChart size={16} className="text-orange-500" />
                  收益-风险散点图
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    className="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none"
                    value={chart1Strategy}
                    onChange={(e) => setChart1Strategy(e.target.value)}
                  >
                    <option value="全部">全部策略</option>
                    {MOCK_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="text-[10px] text-gray-400 italic">气泡大小 = 资产规模</div>
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" dataKey="x" name="波动率" unit="%" label={{ value: '波动率', position: 'insideBottomRight', offset: -10, fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name="收益率" unit="%" label={{ value: '收益率', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="规模" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                              <div className="font-bold mb-1 text-orange-600">{data.name}</div>
                              <div className="text-[10px] text-gray-400 mb-2">{data.strategy}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-gray-400">收益率:</span> <span className="font-mono">{data.y.toFixed(2)}%</span>
                                <span className="text-gray-400">波动率:</span> <span className="font-mono">{data.x.toFixed(2)}%</span>
                                <span className="text-gray-400">资产规模:</span> <span className="font-mono">{data.z.toFixed(2)}亿</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={5.65} stroke="#999" strokeDasharray="3 3">
                      <Label value="对照组中位波动率: 5.65%" position="top" fontSize={10} fill="#999" />
                    </ReferenceLine>
                    <ReferenceLine y={0.56} stroke="#999" strokeDasharray="3 3">
                      <Label value="对照组中位收益: 0.56%" position="right" fontSize={10} fill="#999" />
                    </ReferenceLine>
                    <Scatter name="专户" data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={selectedAccount?.id === entry.id ? '#7c3aed' : '#ddd6fe'} 
                          stroke={selectedAccount?.id === entry.id ? '#5b21b6' : '#c4b5fd'}
                          strokeWidth={selectedAccount?.id === entry.id ? 2 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Outperformance Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 size={16} className="text-orange-500" />
                  跑赢/跑输对照组统计图
                </h3>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outperformanceData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" fontSize={10} width={60} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
                    <Bar dataKey="win" name="跑赢对照组 (收益 > 中位数)" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} barSize={20} />
                    <Bar dataKey="loss" name="跑输对照组 (收益 ≤ 中位数)" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Trend Line */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <LineChartIcon size={16} className="text-orange-500" />
                  收益率走势对比
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    className="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none"
                    value={chart3Strategy}
                    onChange={(e) => setChart3Strategy(e.target.value)}
                  >
                    <option value="全部">全部策略</option>
                    {MOCK_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="flex gap-2 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> 专户收益</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-gray-300 border-t border-dashed border-gray-400"></span> 对照组中位数</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                              <div className="font-bold mb-1 text-gray-900">{payload[0].payload.name}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-gray-400">专户收益:</span> <span className="font-mono text-purple-600 font-bold">{payload[0].value?.toFixed(2)}%</span>
                                <span className="text-gray-400">对照组中位数:</span> <span className="font-mono text-gray-500">{payload[1].value?.toFixed(2)}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="value" fill="#f5f3ff" stroke="none" />
                    <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="median" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Rank Histogram */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 size={16} className="text-orange-500" />
                  排名分布直方图
                </h3>
                <select 
                  className="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none"
                  value={chart4Strategy}
                  onChange={(e) => setChart4Strategy(e.target.value)}
                >
                  <option value="全部">全部策略</option>
                  {MOCK_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} label={{ value: '专户数量', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                              <div className="font-bold mb-1 text-orange-600">{data.range}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-gray-400">专户数量:</span> <span className="font-mono">{data.count}个</span>
                                <span className="text-gray-400">占比:</span> <span className="font-mono">{data.percentage}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Size vs Return Bubble */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <PieChart size={16} className="text-orange-500" />
                  规模 vs 收益率气泡图
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    className="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none"
                    value={chart5Strategy}
                    onChange={(e) => setChart5Strategy(e.target.value)}
                  >
                    <option value="全部">全部策略</option>
                    {MOCK_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="text-[10px] text-gray-400 italic">气泡大小 = 波动率</div>
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="资产规模" 
                      unit="亿" 
                      scale="log" 
                      domain={['auto', 'auto']}
                      label={{ value: '资产规模 (亿, 对数坐标)', position: 'insideBottomRight', offset: -10, fontSize: 10 }} 
                    />
                    <YAxis type="number" dataKey="y" name="收益率" unit="%" label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <ZAxis type="number" dataKey="z" range={[6, 20]} name="波动率" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                              <div className="font-bold mb-1 text-orange-600">{data.name}</div>
                              <div className="text-[10px] text-gray-400 mb-2">{data.strategy}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-gray-400">收益率:</span> <span className="font-mono">{data.y.toFixed(2)}%</span>
                                <span className="text-gray-400">资产规模:</span> <span className="font-mono">{data.x.toFixed(2)}亿</span>
                                <span className="text-gray-400">波动率:</span> <span className="font-mono">{data.z.toFixed(2)}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="专户" data={bubbleData}>
                      {bubbleData.map((entry, index) => {
                        // Color coding by strategy
                        const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#84cc16', '#06b6d4'];
                        const strategyIndex = MOCK_STRATEGIES.indexOf(entry.strategy) % colors.length;
                        return <Cell key={`cell-${index}`} fill={colors[strategyIndex]} fillOpacity={0.7} stroke={colors[strategyIndex]} strokeWidth={1} />;
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Waterfall / Contribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 size={16} className="text-orange-500" />
                  业绩贡献瀑布图
                </h3>
                <div className="flex bg-gray-100 p-0.5 rounded text-[10px]">
                  <button 
                    onClick={() => setChart6Dimension('strategy')}
                    className={cn("px-2 py-0.5 rounded", chart6Dimension === 'strategy' ? "bg-white shadow-sm font-bold" : "text-gray-500")}
                  >
                    按策略
                  </button>
                  <button 
                    onClick={() => setChart6Dimension('dept')}
                    className={cn("px-2 py-0.5 rounded", chart6Dimension === 'dept' ? "bg-white shadow-sm font-bold" : "text-gray-500")}
                  >
                    按部门
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={contributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} unit="%" label={{ value: '收益贡献 (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                              <div className="font-bold mb-1 text-gray-900">{data.name}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-gray-400">贡献值:</span> <span className={cn("font-mono font-bold", data.value >= 0 ? "text-green-600" : "text-red-600")}>{data.value > 0 ? '+' : ''}{data.value.toFixed(2)}%</span>
                                {!data.isTotal && (
                                  <>
                                    <span className="text-gray-400">收益率:</span> <span className="font-mono">{data.return.toFixed(2)}%</span>
                                    <span className="text-gray-400">规模:</span> <span className="font-mono">{data.size.toFixed(2)}亿</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" barSize={40}>
                      {contributionData.map((entry, index) => {
                        const isPositive = entry.value >= 0;
                        const color = entry.isTotal ? '#475569' : isPositive ? '#22c55e' : '#ef4444';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
          )}

          {/* Account Detail Modal */}
          <AccountDetailModal 
            account={selectedAccount} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        </>
      ) : activeModule === '委外资管' && activeSubModule === '数据同步' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex bg-white p-1 rounded border border-gray-200">
              <button 
                onClick={() => setSyncTab('product')}
                className={cn(
                  "px-6 py-2 text-xs font-bold rounded transition-all",
                  syncTab === 'product' ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                产品数据
              </button>
              <button 
                onClick={() => setSyncTab('netValue')}
                className={cn(
                  "px-6 py-2 text-xs font-bold rounded transition-all",
                  syncTab === 'netValue' ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                净值数据
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>上次同步时间: 2026-03-27 09:00:00</span>
            </div>
          </div>

          {syncTab === 'product' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 mb-1">已同步产品总数</div>
                  <div className="text-3xl font-bold text-gray-900">124</div>
                  <div className="mt-2 text-[10px] text-green-600 flex items-center gap-1">
                    <ArrowUpRight size={12} />
                    <span>较上次 +2</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                  <div className="text-xs text-gray-400 mb-1">本次新增产品</div>
                  <div className="text-3xl font-bold text-green-600">3</div>
                  <div className="mt-2 text-[10px] text-gray-400">新入池专户产品</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                  <div className="text-xs text-gray-400 mb-1">本次减少产品</div>
                  <div className="text-3xl font-bold text-red-600">1</div>
                  <div className="mt-2 text-[10px] text-gray-400">已到期或退出产品</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">同步产品明细</h3>
                  <button className="text-xs text-purple-600 font-bold hover:underline">导出明细</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 font-medium">
                      <tr>
                        <th className="px-6 py-3">专户资产编码</th>
                        <th className="px-6 py-3">专户代码</th>
                        <th className="px-6 py-3">专户名称</th>
                        <th className="px-6 py-3">管理人</th>
                        <th className="px-6 py-3">管理部门</th>
                        <th className="px-6 py-3">策略类型</th>
                        <th className="px-6 py-3">同步状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { id: 'A001', code: 'ZH001', name: '稳健增长1号', manager: '中信证券', dept: '权益投资部', type: '股票多头', status: 'new' },
                        { id: 'A002', code: 'ZH002', name: '量化对冲3号', manager: '华泰证券', dept: '量化投资部', type: '量化中性', status: 'sync' },
                        { id: 'A003', code: 'ZH003', name: '固定收益5号', manager: '招商证券', dept: '固定收益部', type: '纯债策略', status: 'sync' },
                        { id: 'A004', code: 'ZH004', name: '宏观对冲2号', manager: '广发证券', dept: '衍生品部', type: '宏观策略', status: 'sync' },
                        { id: 'A005', code: 'ZH005', name: '多策略优选', manager: '国泰君安', dept: '资产管理部', type: '多策略', status: 'reduced' },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-gray-500">{item.id}</td>
                          <td className="px-6 py-4 font-mono text-gray-500">{item.code}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-gray-600">{item.manager}</td>
                          <td className="px-6 py-4 text-gray-600">{item.dept}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">{item.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            {item.status === 'new' ? (
                              <span className="text-green-600 font-bold flex items-center gap-1">
                                <Plus size={12} /> 新增
                              </span>
                            ) : item.status === 'reduced' ? (
                              <span className="text-red-600 font-bold flex items-center gap-1">
                                <Minus size={12} /> 减少
                              </span>
                            ) : (
                              <span className="text-gray-400">已同步</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-orange-500 shrink-0" size={18} />
                <div>
                  <div className="text-sm font-bold text-orange-800">净值数据异常提醒</div>
                  <div className="text-xs text-orange-700 mt-1">检测到 5 个专户产品存在净值缺失，请及时核对同步源数据。</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">缺失净值产品列表</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 font-medium">
                      <tr>
                        <th className="px-6 py-3">专户资产编码</th>
                        <th className="px-6 py-3">专户名称</th>
                        <th className="px-6 py-3">最后净值日期</th>
                        <th className="px-6 py-3">缺失天数</th>
                        <th className="px-6 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { id: 'A012', name: '稳健增长8号', lastDate: '2026-03-20', days: 7 },
                        { id: 'A045', name: '量化对冲12号', lastDate: '2026-03-24', days: 3 },
                        { id: 'A089', name: '固定收益22号', lastDate: '2026-03-25', days: 2 },
                        { id: 'A102', name: '宏观对冲8号', lastDate: '2026-03-26', days: 1 },
                        { id: 'A115', name: '多策略精选', lastDate: '2026-03-22', days: 5 },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-gray-500">{item.id}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-gray-600">{item.lastDate}</td>
                          <td className="px-6 py-4 text-red-600 font-bold">{item.days} 天</td>
                          <td className="px-6 py-4">
                            <button className="text-purple-600 font-bold hover:underline">手动补录</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeModule === '委外资管' && activeSubModule === '委外产品' ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Briefcase size={32} />
          </div>
          <div className="text-lg font-medium">委外产品 模块开发中...</div>
          <button 
            onClick={() => setActiveSubModule('专户业绩')}
            className="text-purple-600 text-sm font-bold hover:underline"
          >
            返回专户业绩
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <LayoutDashboard size={32} />
          </div>
          <div className="text-lg font-medium">{activeModule} 模块开发中...</div>
          <button 
            onClick={() => {
              setActiveModule('委外资管');
              setActiveSubModule('专户业绩');
            }}
            className="text-purple-600 text-sm font-bold hover:underline"
          >
            返回专户业绩
          </button>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
