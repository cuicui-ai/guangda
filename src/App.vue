<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
} from 'lucide-vue-next';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart, BarChart, LineChart, PieChart as EPieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  ScatterChart,
  BarChart,
  LineChart,
  EPieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent
]);

import { cn } from '@/src/lib/utils';
import { 
  MOCK_ACCOUNTS, 
  MOCK_STRATEGIES, 
  MOCK_DEPARTMENTS, 
  SpecialAccount 
} from './data';

// --- State ---
const activeModule = ref('委外资管');
const activeSubModule = ref('专户业绩');
const activeTab = ref<'list' | 'strategy' | 'dept'>('list');
const selectedPeriod = ref('近一年');
const customDateRange = ref({ start: '', end: '' });
const selectedAccount = ref<SpecialAccount | null>(null);
const isModalOpen = ref(false);
const viewMode = ref<'list' | 'analysis'>('list');
const syncTab = ref<'product' | 'netValue'>('product');
const searchQuery = ref('');
const selectedStrategy = ref('全部');
const expandedStrategies = ref(new Set<string>());
const expandedDepartments = ref(new Set<string>());

const chart1Strategy = ref('全部');
const chart3Strategy = ref('全部');
const chart4Strategy = ref('全部');
const chart5Strategy = ref('全部');
const chart6Dimension = ref<'strategy' | 'dept'>('strategy');

// --- ECharts Options ---
const scatterOption = computed(() => {
  const accounts = MOCK_ACCOUNTS.filter(acc => chart1Strategy.value === '全部' || acc.strategyType === chart1Strategy.value);
  const data = accounts.map(acc => {
    const perf = acc.performance[selectedPeriod.value] || acc.performance['近一年'];
    return [perf.volatility, perf.returnRate, acc.netAssetValue, acc.name, acc.strategyType];
  });

  return {
    backgroundColor: 'transparent',
    grid: { top: '15%', right: '5%', bottom: '15%', left: '10%' },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      padding: 0,
      formatter: (params: any) => {
        const d = params.data;
        return `<div class="p-3 shadow-xl rounded-lg text-xs">
          <div class="font-bold text-orange-600 mb-1">${d[3]}</div>
          <div class="text-[10px] text-gray-400 mb-2">${d[4]}</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1">
            <span class="text-gray-400">收益率:</span> <b class="text-right font-mono">${d[1].toFixed(2)}%</b>
            <span class="text-gray-400">波动率:</span> <b class="text-right font-mono">${d[0].toFixed(2)}%</b>
            <span class="text-gray-400">资产规模:</span> <b class="text-right font-mono">${d[2].toFixed(2)}亿</b>
          </div>
        </div>`;
      }
    },
    xAxis: { 
      name: '波动率', 
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLabel: { color: '#999', fontSize: 10 },
      nameTextStyle: { fontSize: 10, color: '#999' }
    },
    yAxis: { 
      name: '收益率', 
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLabel: { color: '#999', fontSize: 10 },
      nameTextStyle: { fontSize: 10, color: '#999' }
    },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: (data: any) => Math.sqrt(data[2]) * 8 + 5,
      itemStyle: {
        color: '#7c3aed',
        opacity: 0.6,
        borderColor: '#5b21b6',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
          borderWidth: 2
        }
      }
    }]
  };
});

// --- Computed ---
const filteredAccounts = computed(() => {
  return MOCK_ACCOUNTS.filter(acc => {
    const matchesSearch = acc.name.includes(searchQuery.value) || acc.code.includes(searchQuery.value);
    const matchesStrategy = selectedStrategy.value === '全部' || acc.strategyType === selectedStrategy.value;
    return matchesSearch && matchesStrategy;
  });
});

const strategySummaries = computed(() => {
  return MOCK_STRATEGIES.map(type => {
    const accounts = MOCK_ACCOUNTS.filter(a => a.strategyType === type);
    const perfData = accounts.map(a => a.performance[selectedPeriod.value] || a.performance['近一年']);
    
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
});

const departmentSummaries = computed(() => {
  return MOCK_DEPARTMENTS.map(deptName => {
    const deptAccounts = MOCK_ACCOUNTS.filter(a => a.department === deptName);
    const strategiesInDept = Array.from(new Set(deptAccounts.map(a => a.strategyType)));
    
    const strategies = strategiesInDept.map(strategyType => {
      const accounts = deptAccounts.filter(a => a.strategyType === strategyType);
      const perfData = accounts.map(a => a.performance[selectedPeriod.value] || a.performance['近一年']);
      
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

    const deptPerfData = deptAccounts.map(a => a.performance[selectedPeriod.value] || a.performance['近一年']);

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
});

// --- Methods ---
const handleAccountClick = (account: SpecialAccount) => {
  selectedAccount.value = account;
  isModalOpen.value = true;
};

const toggleStrategyExpansion = (strategyType: string) => {
  if (expandedStrategies.value.has(strategyType)) {
    expandedStrategies.value.delete(strategyType);
  } else {
    expandedStrategies.value.add(strategyType);
  }
};

const toggleDepartmentExpansion = (deptName: string) => {
  if (expandedDepartments.value.has(deptName)) {
    expandedDepartments.value.delete(deptName);
  } else {
    expandedDepartments.value.add(deptName);
  }
};

// --- Sparkline Helper ---
const getSparklinePoints = (data: number[]) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  return data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((val - min) / range) * 15;
    return `${x},${y}`;
  }).join(' ');
};

</script>

<template>
  <div class="flex h-screen bg-[#f3f4f6] font-sans text-gray-900 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div class="p-4 flex items-center gap-2">
        <div class="w-8 h-8 bg-[#e11d48] rounded flex items-center justify-center text-white font-bold">
          <div class="w-4 h-4 border-2 border-white rounded-sm" />
        </div>
        <h1 class="font-bold text-sm tracking-tight text-[#4c0519]">光大FOF投研平台</h1>
      </div>
      
      <nav class="flex-1 py-2">
        <div 
          v-for="item in [
            { icon: LayoutDashboard, label: '模拟组合test' },
            { icon: Briefcase, label: '基金产品' },
            { icon: PieChart, label: '基金池' },
            { icon: User, label: '基金经理' },
            { icon: Briefcase, label: '入池管理' },
            { icon: AlertCircle, label: '风控设置' },
            { icon: LayoutDashboard, label: '系统管理' },
            { icon: Briefcase, label: '权限申请' },
            { icon: TrendingUp, label: '委外资管' }
          ]"
          :key="item.label"
          @click="activeModule = item.label"
          :class="cn(
            'flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group text-sm font-medium',
            activeModule === item.label ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
          )"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" :size="18" :class="cn(activeModule === item.label ? 'text-purple-700' : 'text-gray-400 group-hover:text-gray-600')" />
            <span>{{ item.label }}</span>
          </div>
          <div v-if="activeModule === item.label" class="w-1 h-4 bg-purple-600 rounded-full" />
        </div>

        <div v-if="activeModule === '委外资管'" class="bg-gray-50/50 py-1">
          <div 
            v-for="sub in ['委外产品', '专户业绩', '数据同步']"
            :key="sub"
            @click="activeSubModule = sub"
            :class="cn(
              'pl-12 pr-4 py-2 cursor-pointer text-xs transition-colors',
              activeSubModule === sub ? 'text-purple-700 font-bold' : 'text-gray-500 hover:text-gray-700'
            )"
          >
            {{ sub }}
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-2 h-full">
          <div class="flex items-center px-4 h-full text-xs text-gray-400 font-medium border-r border-gray-100">
            首页
          </div>
          <div class="flex items-center gap-2 px-4 h-full bg-purple-50 text-purple-700 text-xs font-bold border-r border-gray-100 relative">
            业绩分析
            <button class="text-purple-300 hover:text-purple-500">
              <AlertCircle :size="10" class="rotate-45" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative">
            <input 
              type="text" 
              placeholder="基金代码/基金名称/基金经理" 
              class="w-64 pl-4 pr-10 py-1.5 bg-gray-100 border-none rounded-full text-[11px] outline-none"
              v-model="searchQuery"
            />
            <Search class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" :size="14" />
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <Bell :size="18" class="text-gray-400" />
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center border-2 border-white">12</span>
            </div>
            <AlertCircle :size="18" class="text-gray-400" />
            <div class="h-4 w-px bg-gray-200" />
            <div class="flex items-center gap-2 text-xs font-medium text-gray-700">
              <User :size="18" class="text-gray-400" />
              <span>张三</span>
              <ChevronDown :size="14" class="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <template v-if="activeModule === '委外资管' && activeSubModule === '专户业绩'">
          <!-- Filters & Tabs -->
          <section class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="flex bg-white p-1 rounded border border-gray-200">
                <button 
                  v-for="p in ['近一周', '近一月', '近三月', '近六月', '近一年', '近三年', '成立以来']"
                  :key="p"
                  @click="selectedPeriod = p"
                  :class="cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-all',
                    selectedPeriod === p ? 'bg-purple-700 text-white' : 'text-gray-500 hover:bg-gray-100'
                  )"
                >
                  {{ p }}
                </button>
              </div>
              <div class="flex items-center gap-2 bg-white px-3 py-1 rounded border border-gray-200">
                <span class="text-[10px] text-gray-400">自定义:</span>
                <input 
                  type="date" 
                  class="text-[10px] border-none outline-none bg-transparent" 
                  v-model="customDateRange.start"
                />
                <span class="text-gray-300">-</span>
                <input 
                  type="date" 
                  class="text-[10px] border-none outline-none bg-transparent" 
                  v-model="customDateRange.end"
                />
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div v-if="viewMode === 'list'" class="flex items-center gap-8">
                <button
                  v-for="tab in [{ id: 'list', label: '专户列表' }, { id: 'strategy', label: '策略汇总' }, { id: 'dept', label: '部门策略汇总' }]"
                  :key="tab.id"
                  @click="activeTab = tab.id as any"
                  :class="cn(
                    'pb-2 text-xs font-bold transition-all border-b-2',
                    activeTab === tab.id ? 'text-purple-700 border-purple-700' : 'text-gray-400 border-transparent hover:text-gray-600'
                  )"
                >
                  {{ tab.label }}
                </button>
              </div>
              <div v-else />

              <div class="flex bg-white p-1 rounded border border-gray-200">
                <button
                  @click="viewMode = 'list'"
                  :class="cn(
                    'px-4 py-1.5 text-xs font-bold rounded transition-all',
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  )"
                >
                  列表展示
                </button>
                <button
                  @click="viewMode = 'analysis'"
                  :class="cn(
                    'px-4 py-1.5 text-xs font-bold rounded transition-all',
                    viewMode === 'analysis' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  )"
                >
                  业绩分析
                </button>
              </div>
            </div>

            <div v-if="viewMode === 'list'" class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">专户名称:</span>
                <input 
                  type="text" 
                  placeholder="请输入专户名称/代码/资产编码" 
                  class="w-64 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none focus:border-purple-500"
                  v-model="searchQuery"
                />
                <button class="px-6 py-1.5 bg-orange-500 text-white text-xs font-bold rounded">查询</button>
              </div>
              <button class="px-6 py-1.5 bg-orange-500 text-white text-xs font-bold rounded">导出</button>
            </div>
          </section>

          <!-- List Section -->
          <section v-if="viewMode === 'list'" class="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <template v-if="activeTab === 'list'">
                    <tr class="bg-[#f3e8ff]/30 border-b border-gray-100">
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户资产编码</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户代码</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户名称</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">管理人</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户管理部门</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">策略类型</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">成立日期</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-right">资产净值 (元)</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center">业绩走势</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colspan="3">业绩走势</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100">比较基准/对照组</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colspan="3">对照组中位数</th>
                    </tr>
                    <tr class="bg-[#f3e8ff]/10 border-b border-gray-100">
                      <th colspan="9" />
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">可转换债券型基金</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤</th>
                    </tr>
                  </template>
                  <template v-else-if="activeTab === 'strategy'">
                    <tr class="bg-[#f3e8ff]/30 border-b border-gray-100">
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">策略类型</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center">专户数量</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-right">总规模(亿)</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colspan="3">业绩走势</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100">比较基准/对照组</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colspan="4">对照组中位数</th>
                    </tr>
                    <tr class="bg-[#f3e8ff]/10 border-b border-gray-100">
                      <th colspan="3" />
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100" />
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">跑赢数量</th>
                    </tr>
                  </template>
                  <template v-else>
                    <tr class="bg-[#f3e8ff]/30 border-b border-gray-100">
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">专户管理部门</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60">策略类型</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center">专户数量</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-right">总规模(亿)</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colspan="3">业绩走势</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100">比较基准/对照组</th>
                      <th class="px-4 py-3 text-[11px] font-bold text-purple-900/60 text-center border-l border-purple-100" colspan="4">对照组中位数</th>
                    </tr>
                    <tr class="bg-[#f3e8ff]/10 border-b border-gray-100">
                      <th colspan="4" />
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100" />
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center border-l border-purple-100">收益率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">波动率(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">最大回撤(%)</th>
                      <th class="px-2 py-1 text-[10px] font-bold text-purple-900/40 text-center">跑赢数量</th>
                    </tr>
                  </template>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <!-- List Mode -->
                  <template v-if="activeTab === 'list'">
                    <tr 
                      v-for="acc in filteredAccounts.slice(0, 15)" 
                      :key="acc.id" 
                      @click="handleAccountClick(acc)"
                      :class="cn(
                        'hover:bg-purple-50/30 cursor-pointer transition-colors group text-[11px]',
                        selectedAccount?.id === acc.id ? 'bg-purple-50' : ''
                      )"
                    >
                      <td class="px-4 py-3 font-mono text-gray-500">{{ acc.code }}</td>
                      <td class="px-4 py-3 font-mono text-gray-500">{{ acc.code }}</td>
                      <td class="px-4 py-3 font-bold text-gray-700">{{ acc.name }}</td>
                      <td class="px-4 py-3 text-gray-600">国泰基金管理有限公司</td>
                      <td class="px-4 py-3 text-gray-600">{{ acc.department }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ acc.strategyType }}</td>
                      <td class="px-4 py-3 text-gray-500">2022-06-30</td>
                      <td class="px-4 py-3 font-bold text-right text-gray-700">{{ acc.netAssetValue.toFixed(2) }}</td>
                      <td class="px-4 py-3 text-center">
                        <svg width="60" height="20" class="overflow-visible mx-auto">
                          <polyline
                            fill="none"
                            stroke="#8b5cf6"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :points="getSparklinePoints([10, 15, 8, 12, 20, 15, 25])"
                          />
                        </svg>
                      </td>
                      <td class="px-4 py-3 font-bold text-center text-gray-700 border-l border-gray-50">
                        {{ (acc.performance[selectedPeriod] || acc.performance['近一年']).returnRate.toFixed(2) }}
                      </td>
                      <td class="px-4 py-3 text-center text-gray-600">
                        {{ (acc.performance[selectedPeriod] || acc.performance['近一年']).volatility.toFixed(2) }}
                      </td>
                      <td class="px-4 py-3 text-center text-gray-600">
                        {{ (acc.performance[selectedPeriod] || acc.performance['近一年']).maxDrawdown.toFixed(2) }}
                      </td>
                      <td class="px-4 py-3 text-gray-500 text-center border-l border-gray-50">可转换债券型基金</td>
                      <td class="px-4 py-3 text-center text-gray-600 border-l border-gray-50">1.34</td>
                      <td class="px-4 py-3 text-center text-gray-600">13.54</td>
                      <td class="px-4 py-3 text-center text-gray-600">0.71</td>
                    </tr>
                  </template>

                  <!-- Strategy Mode -->
                  <template v-else-if="activeTab === 'strategy'">
                    <template v-for="summary in strategySummaries" :key="summary.type">
                      <tr 
                        @click="toggleStrategyExpansion(summary.type)"
                        class="hover:bg-purple-50/30 cursor-pointer transition-colors group bg-gray-50/30 text-[11px]"
                      >
                        <td class="px-4 py-3 font-bold text-gray-700 flex items-center gap-2">
                          <ChevronDown v-if="expandedStrategies.has(summary.type)" :size="14" class="text-purple-600" />
                          <ChevronRight v-else :size="14" class="text-gray-400" />
                          {{ summary.type }}
                        </td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ summary.accountCount }}</td>
                        <td class="px-4 py-3 font-bold text-right text-gray-700">{{ summary.totalSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                        <td class="px-4 py-3 font-bold text-center text-gray-700 border-l border-gray-50">{{ summary.avgReturn.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ summary.avgVolatility.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ summary.avgMaxDrawdown.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-gray-500 text-center border-l border-gray-50">{{ summary.benchmarkName }}</td>
                        <td class="px-4 py-3 text-center text-gray-600 border-l border-gray-50">{{ summary.medianReturn.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ summary.medianVolatility.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ summary.medianMaxDrawdown.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ summary.outperformCount }}</td>
                      </tr>
                      <template v-if="expandedStrategies.has(summary.type)">
                        <tr 
                          v-for="acc in MOCK_ACCOUNTS.filter(a => a.strategyType === summary.type)"
                          :key="acc.id"
                          @click.stop="handleAccountClick(acc)"
                          :class="cn(
                            'hover:bg-purple-50/20 cursor-pointer transition-colors text-[10px]',
                            selectedAccount?.id === acc.id ? 'bg-purple-50/50' : ''
                          )"
                        >
                          <td class="px-8 py-2 text-gray-500 italic">{{ acc.name }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">-</td>
                          <td class="px-4 py-2 text-right text-gray-500">{{ acc.netAssetValue.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-500 border-l border-gray-50">{{ (acc.performance[selectedPeriod] || acc.performance['近一年']).returnRate.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ (acc.performance[selectedPeriod] || acc.performance['近一年']).volatility.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ (acc.performance[selectedPeriod] || acc.performance['近一年']).maxDrawdown.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400 border-l border-gray-50">-</td>
                          <td class="px-4 py-2 text-center text-gray-400 border-l border-gray-50">-</td>
                          <td class="px-4 py-2 text-center text-gray-400">-</td>
                          <td class="px-4 py-2 text-center text-gray-400">-</td>
                          <td class="px-4 py-2 text-center text-gray-400">-</td>
                        </tr>
                      </template>
                    </template>
                  </template>

                  <!-- Dept Mode -->
                  <template v-else>
                    <template v-for="dept in departmentSummaries" :key="dept.name">
                      <tr 
                        @click="toggleDepartmentExpansion(dept.name)"
                        class="hover:bg-purple-50/30 cursor-pointer transition-colors group bg-gray-100/50 text-[11px]"
                      >
                        <td class="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                          <ChevronDown v-if="expandedDepartments.has(dept.name)" :size="14" class="text-purple-600" />
                          <ChevronRight v-else :size="14" class="text-gray-400" />
                          {{ dept.name }}
                        </td>
                        <td class="px-4 py-3 text-gray-400">-</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ dept.accountCount }}</td>
                        <td class="px-4 py-3 font-bold text-right text-gray-700">{{ dept.totalSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                        <td class="px-4 py-3 font-bold text-center text-gray-700 border-l border-gray-50">{{ dept.avgReturn.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ dept.avgVolatility.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ dept.avgMaxDrawdown.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-gray-400 text-center border-l border-gray-50">-</td>
                        <td class="px-4 py-3 text-center text-gray-600 border-l border-gray-50">{{ dept.avgReturn.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ dept.avgVolatility.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-600">{{ dept.avgMaxDrawdown.toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-gray-400">-</td>
                      </tr>
                      <template v-if="expandedDepartments.has(dept.name)">
                        <tr 
                          v-for="strategy in dept.strategies"
                          :key="strategy.type"
                          class="hover:bg-purple-50/20 transition-colors group bg-white text-[10px]"
                        >
                          <td class="px-8 py-2 text-gray-400 italic">{{ dept.name }}</td>
                          <td class="px-4 py-2 text-gray-600">{{ strategy.type }}</td>
                          <td class="px-4 py-2 text-center text-gray-500">{{ strategy.accountCount }}</td>
                          <td class="px-4 py-2 text-right text-gray-500">{{ strategy.totalSize.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-500 border-l border-gray-50">{{ strategy.avgReturn.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ strategy.avgVolatility.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ strategy.avgMaxDrawdown.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-500 border-l border-gray-50">{{ strategy.benchmarkName }}</td>
                          <td class="px-4 py-2 text-center text-gray-400 border-l border-gray-50">{{ strategy.medianReturn.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ strategy.medianVolatility.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ strategy.medianMaxDrawdown.toFixed(2) }}</td>
                          <td class="px-4 py-2 text-center text-gray-400">{{ strategy.outperformCount }}</td>
                        </tr>
                      </template>
                    </template>
                  </template>
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div v-if="activeTab === 'list'" class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span class="text-xs text-gray-400">显示 1-10 条，共 {{ filteredAccounts.length }} 条</span>
              <div class="flex gap-2">
                <button class="p-1 rounded hover:bg-gray-200 text-gray-400"><Menu :size="14" /></button>
                <button class="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">上一页</button>
                <button class="px-3 py-1 bg-orange-600 text-white rounded text-xs font-medium">1</button>
                <button class="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">2</button>
                <button class="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">下一页</button>
              </div>
            </div>
          </section>

          <!-- Analysis Section (Charts Placeholder) -->
          <section v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Chart 1: Return-Risk Scatter -->
            <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                   <PieChart :size="16" class="text-orange-500" />
                   收益-风险散点图
                </h3>
                <div class="flex items-center gap-2">
                  <select 
                    class="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none"
                    v-model="chart1Strategy"
                  >
                    <option value="全部">全部策略</option>
                    <option v-for="s in MOCK_STRATEGIES" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <div class="text-[10px] text-gray-400 italic">气泡大小 = 资产规模</div>
                </div>
              </div>
              <div class="flex-1 w-full h-full">
                <VChart class="w-full h-full" :option="scatterOption" autoresize />
              </div>
            </div>

            <div v-for="i in 5" :key="i" class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px] justify-center items-center text-gray-400">
               <PieChart :size="48" class="mb-4 opacity-20" />
               <div class="text-sm font-bold">图表 {{ i + 1 }} 加载中...</div>
               <div class="text-[10px]">请集成更多 ECharts 配置以显示详细分析</div>
            </div>
          </section>
        </template>

        <!-- Data Sync Module -->
        <template v-else-if="activeModule === '委外资管' && activeSubModule === '数据同步'">
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex bg-white p-1 rounded border border-gray-200">
                <button 
                  @click="syncTab = 'product'"
                  :class="cn(
                    'px-6 py-2 text-xs font-bold rounded transition-all',
                    syncTab === 'product' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  )"
                >
                  产品数据
                </button>
                <button 
                  @click="syncTab = 'netValue'"
                  :class="cn(
                    'px-6 py-2 text-xs font-bold rounded transition-all',
                    syncTab === 'netValue' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  )"
                >
                  净值数据
                </button>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <RefreshCw :size="14" class="animate-spin-slow" />
                <span>上次同步时间: 2026-03-27 09:00:00</span>
              </div>
            </div>

            <div v-if="syncTab === 'product'" class="space-y-6">
              <div class="grid grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div class="text-xs text-gray-400 mb-1">已同步产品总数</div>
                  <div class="text-3xl font-bold text-gray-900">124</div>
                  <div class="mt-2 text-[10px] text-green-600 flex items-center gap-1">
                    <ArrowUpRight :size="12" />
                    <span>较上次 +2</span>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                  <div class="text-xs text-gray-400 mb-1">本次新增产品</div>
                  <div class="text-3xl font-bold text-green-600">3</div>
                  <div class="mt-2 text-[10px] text-gray-400">新入池专户产品</div>
                </div>
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                  <div class="text-xs text-gray-400 mb-1">本次减少产品</div>
                  <div class="text-3xl font-bold text-red-600">1</div>
                  <div class="mt-2 text-[10px] text-gray-400">已到期或退出产品</div>
                </div>
              </div>

              <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h3 class="text-sm font-bold text-gray-900">同步产品明细</h3>
                  <button class="text-xs text-purple-600 font-bold hover:underline">导出明细</button>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-gray-50 text-gray-400 font-medium">
                      <tr>
                        <th class="px-6 py-3">专户资产编码</th>
                        <th class="px-6 py-3">专户代码</th>
                        <th class="px-6 py-3">专户名称</th>
                        <th class="px-6 py-3">管理人</th>
                        <th class="px-6 py-3">管理部门</th>
                        <th class="px-6 py-3">策略类型</th>
                        <th class="px-6 py-3">同步状态</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr v-for="item in [
                        { id: 'A001', code: 'ZH001', name: '稳健增长1号', manager: '中信证券', dept: '权益投资部', type: '股票多头', status: 'new' },
                        { id: 'A002', code: 'ZH002', name: '量化对冲3号', manager: '华泰证券', dept: '量化投资部', type: '量化中性', status: 'sync' },
                        { id: 'A003', code: 'ZH003', name: '固定收益5号', manager: '招商证券', dept: '固定收益部', type: '纯债策略', status: 'sync' },
                        { id: 'A004', code: 'ZH004', name: '宏观对冲2号', manager: '广发证券', dept: '衍生品部', type: '宏观策略', status: 'sync' },
                        { id: 'A005', code: 'ZH005', name: '多策略优选', manager: '国泰君安', dept: '资产管理部', type: '多策略', status: 'reduced' },
                      ]" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                        <td class="px-6 py-4 font-mono text-gray-500">{{ item.id }}</td>
                        <td class="px-6 py-4 font-mono text-gray-500">{{ item.code }}</td>
                        <td class="px-6 py-4 font-bold text-gray-900">{{ item.name }}</td>
                        <td class="px-6 py-4 text-gray-600">{{ item.manager }}</td>
                        <td class="px-6 py-4 text-gray-600">{{ item.dept }}</td>
                        <td class="px-6 py-4">
                          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">{{ item.type }}</span>
                        </td>
                        <td class="px-6 py-4">
                          <span v-if="item.status === 'new'" class="text-green-600 font-bold flex items-center gap-1">
                            <Plus :size="12" /> 新增
                          </span>
                          <span v-else-if="item.status === 'reduced'" class="text-red-600 font-bold flex items-center gap-1">
                            <Minus :size="12" /> 减少
                          </span>
                          <span v-else class="text-gray-400">已同步</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-else class="space-y-6">
              <div class="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle class="text-orange-500 shrink-0" :size="18" />
                <div>
                  <div class="text-sm font-bold text-orange-800">净值数据异常提醒</div>
                  <div class="text-xs text-orange-700 mt-1">检测到 5 个专户产品存在净值缺失，请及时核对同步源数据。</div>
                </div>
              </div>
              <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-50">
                  <h3 class="text-sm font-bold text-gray-900">缺失净值产品列表</h3>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-gray-50 text-gray-400 font-medium">
                      <tr>
                        <th class="px-6 py-3">专户资产编码</th>
                        <th class="px-6 py-3">专户名称</th>
                        <th class="px-6 py-3">最后净值日期</th>
                        <th class="px-6 py-3">缺失天数</th>
                        <th class="px-6 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr v-for="item in [
                        { id: 'A012', name: '稳健增长8号', lastDate: '2026-03-20', days: 7 },
                        { id: 'A045', name: '量化对冲12号', lastDate: '2026-03-24', days: 3 },
                        { id: 'A089', name: '固定收益22号', lastDate: '2026-03-25', days: 2 },
                        { id: 'A102', name: '宏观对冲8号', lastDate: '2026-03-26', days: 1 },
                        { id: 'A115', name: '多策略精选', lastDate: '2026-03-22', days: 5 },
                      ]" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                        <td class="px-6 py-4 font-mono text-gray-500">{{ item.id }}</td>
                        <td class="px-6 py-4 font-bold text-gray-900">{{ item.name }}</td>
                        <td class="px-6 py-4 text-gray-600">{{ item.lastDate }}</td>
                        <td class="px-6 py-4 text-red-600 font-bold">{{ item.days }} 天</td>
                        <td class="px-6 py-4">
                          <button class="text-purple-600 font-bold hover:underline">手动补录</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Other Modules -->
        <template v-else>
          <div class="flex flex-col items-center justify-center h-[60vh] text-gray-400 space-y-4">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <LayoutDashboard v-if="activeModule !== '委外资管'" :size="32" />
              <Briefcase v-else :size="32" />
            </div>
            <div class="text-lg font-medium">{{ activeModule }} {{ activeSubModule !== '专户业绩' ? activeSubModule : '' }} 模块开发中...</div>
            <button 
              @click="activeModule = '委外资管'; activeSubModule = '专户业绩'"
              class="text-purple-600 text-sm font-bold hover:underline"
            >
              返回专户业绩
            </button>
          </div>
        </template>
      </div>
    </main>

    <!-- Modal (Simple Implementation without AnimatePresence for now) -->
    <Teleport to="body">
      <div v-if="isModalOpen && selectedAccount" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div @click="isModalOpen = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div class="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 space-y-8">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-2xl font-bold text-gray-900">{{ selectedAccount.name }}</h2>
                <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{{ selectedAccount.code }}</span>
              </div>
              <div class="flex flex-wrap gap-6 text-sm text-gray-500">
                <span class="flex items-center gap-1"><User :size="14" /> 经理: {{ selectedAccount.manager }}</span>
                <span class="flex items-center gap-1"><Briefcase :size="14" /> 部门: {{ selectedAccount.department }}</span>
                <span class="flex items-center gap-1"><TrendingUp :size="14" /> 策略: {{ selectedAccount.strategyType }}</span>
              </div>
            </div>
            <button 
              @click="isModalOpen = false"
              class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X :size="24" />
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="stat in [
              { label: '资产净值', value: selectedAccount.netAssetValue, unit: '亿' },
              { label: '收益率', value: selectedAccount.returnRate, unit: '%', trend: 2.4 },
              { label: '波动率', value: selectedAccount.volatility, unit: '%', trend: -0.5 },
              { label: '最大回撤', value: selectedAccount.maxDrawdown, unit: '%', trend: -1.2 },
            ]" :key="stat.label" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div class="text-xs text-gray-500 mb-1">{{ stat.label }}</div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-bold text-gray-900">{{ stat.value.toFixed(2) }}</span>
                <span v-if="stat.unit" class="text-xs text-gray-400">{{ stat.unit }}</span>
              </div>
              <div v-if="stat.trend" :class="cn('text-[10px] mt-1 font-medium', stat.trend >= 0 ? 'text-green-500' : 'text-red-500')">
                {{ stat.trend >= 0 ? "↑" : "↓" }} {{ Math.abs(stat.trend).toFixed(2) }}%
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
               <div class="flex items-center justify-between mb-6">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">收益率曲线对比</h4>
                <!-- Chart placeholder in modal -->
              </div>
              <div class="h-64 flex items-center justify-center text-gray-400 text-xs italic">
                图表集成中...
              </div>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">近期收益热力图</h4>
              <div class="space-y-3">
                <div v-for="item in [
                  { label: '近1周', val: 1.2 },
                  { label: '近1月', val: 3.5 },
                  { label: '近3月', val: 5.8 },
                  { label: '近6月', val: 8.2 },
                  { label: '近1年', val: 12.4 },
                ]" :key="item.label" class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span class="text-xs font-medium text-gray-600">{{ item.label }}</span>
                  <div :class="cn(
                    'w-12 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white',
                    item.val > 10 ? 'bg-green-700' : item.val > 5 ? 'bg-green-600' : item.val > 0 ? 'bg-green-400' : 'bg-red-400'
                  )">
                    {{ item.val.toFixed(2) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
