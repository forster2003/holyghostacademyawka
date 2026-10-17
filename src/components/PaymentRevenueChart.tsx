import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { PaymentRecord } from '../types';
import { TrendingUp, Calendar, DollarSign, CheckCircle, Clock, Filter, BarChart3 } from 'lucide-react';

interface PaymentRevenueChartProps {
  payments: PaymentRecord[];
  onNavigateToPayments?: () => void;
}

const ACADEMIC_MONTHS = [
  { key: '09', name: 'Sep', fullName: 'September (Term 1 Resumption)' },
  { key: '10', name: 'Oct', fullName: 'October' },
  { key: '11', name: 'Nov', fullName: 'November' },
  { key: '12', name: 'Dec', fullName: 'December (Term 1 Exams)' },
  { key: '01', name: 'Jan', fullName: 'January (Term 2 Resumption)' },
  { key: '02', name: 'Feb', fullName: 'February' },
  { key: '03', name: 'Mar', fullName: 'March' },
  { key: '04', name: 'Apr', fullName: 'April (Term 2 Exams / Easter)' },
  { key: '05', name: 'May', fullName: 'May (Term 3 Resumption)' },
  { key: '06', name: 'Jun', fullName: 'June' },
  { key: '07', name: 'Jul', fullName: 'July (Promotion Exams)' },
  { key: '08', name: 'Aug', fullName: 'August (Summer / Entrance Exams)' },
];

const CALENDAR_MONTHS = [
  { key: '01', name: 'Jan', fullName: 'January' },
  { key: '02', name: 'Feb', fullName: 'February' },
  { key: '03', name: 'Mar', fullName: 'March' },
  { key: '04', name: 'Apr', fullName: 'April' },
  { key: '05', name: 'May', fullName: 'May' },
  { key: '06', name: 'Jun', fullName: 'June' },
  { key: '07', name: 'Jul', fullName: 'July' },
  { key: '08', name: 'Aug', fullName: 'August' },
  { key: '09', name: 'Sep', fullName: 'September' },
  { key: '10', name: 'Oct', fullName: 'October' },
  { key: '11', name: 'Nov', fullName: 'November' },
  { key: '12', name: 'Dec', fullName: 'December' },
];

export const PaymentRevenueChart: React.FC<PaymentRevenueChartProps> = ({
  payments = []
}) => {
  const [viewMode, setViewMode] = useState<'academic' | 'calendar'>('academic');
  const [metricType, setMetricType] = useState<'revenue' | 'volume'>('revenue');
  const [activeYear, setActiveYear] = useState<string>('all');

  // Extract available years from payment dates
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    payments.forEach(p => {
      if (p.paymentDate) {
        const year = p.paymentDate.split('-')[0];
        if (year && year.length === 4) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [payments]);

  // Aggregate monthly data
  const chartData = useMemo(() => {
    const monthOrder = viewMode === 'academic' ? ACADEMIC_MONTHS : CALENDAR_MONTHS;

    // Filter by year if specific year chosen
    const filteredPayments = activeYear === 'all'
      ? payments
      : payments.filter(p => p.paymentDate?.startsWith(activeYear));

    return monthOrder.map(month => {
      let verifiedAmount = 0;
      let pendingAmount = 0;
      let verifiedCount = 0;
      let pendingCount = 0;

      filteredPayments.forEach(p => {
        if (!p.paymentDate) return;
        const parts = p.paymentDate.split('-');
        const paymentMonth = parts[1];

        if (paymentMonth === month.key) {
          const amt = Number(p.amount) || 0;
          if (p.status === 'Verified') {
            verifiedAmount += amt;
            verifiedCount += 1;
          } else if (p.status === 'Pending Verification') {
            pendingAmount += amt;
            pendingCount += 1;
          }
        }
      });

      const totalAmount = verifiedAmount + pendingAmount;
      const totalCount = verifiedCount + pendingCount;

      return {
        month: month.name,
        monthKey: month.key,
        fullName: month.fullName,
        verified: verifiedAmount,
        pending: pendingAmount,
        total: totalAmount,
        verifiedCount,
        pendingCount,
        totalCount
      };
    });
  }, [payments, viewMode, activeYear]);

  // Compute key highlights
  const stats = useMemo(() => {
    let totalVerified = 0;
    let totalPending = 0;
    let totalTransactions = 0;
    let peakMonth = { name: 'None', amount: 0 };

    chartData.forEach(item => {
      totalVerified += item.verified;
      totalPending += item.pending;
      totalTransactions += item.totalCount;

      if (item.verified > peakMonth.amount) {
        peakMonth = { name: item.fullName, amount: item.verified };
      }
    });

    const totalRevenue = totalVerified + totalPending;
    const activeMonthsCount = chartData.filter(m => m.total > 0).length || 1;
    const monthlyAverage = totalVerified / activeMonthsCount;
    const verificationRate = totalRevenue > 0 ? Math.round((totalVerified / totalRevenue) * 100) : 100;

    return {
      totalVerified,
      totalPending,
      totalRevenue,
      totalTransactions,
      peakMonth,
      monthlyAverage,
      verificationRate
    };
  }, [chartData]);

  // Custom Formatter for Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthData = chartData.find(d => d.month === label);
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs min-w-[210px] space-y-2">
          <div className="border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span className="font-bold text-brand-yellow font-heading">{monthData?.fullName || label}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {monthData?.totalCount || 0} txn{(monthData?.totalCount || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-1 font-mono">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Verified:</span>
              </span>
              <span className="font-bold">
                {metricType === 'revenue'
                  ? `₦${(monthData?.verified || 0).toLocaleString('en-NG')}`
                  : `${monthData?.verifiedCount || 0} txns`}
              </span>
            </div>

            {monthData && monthData.pending > 0 && (
              <div className="flex justify-between items-center text-amber-300">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span>Pending:</span>
                </span>
                <span className="font-bold">
                  {metricType === 'revenue'
                    ? `₦${(monthData.pending).toLocaleString('en-NG')}`
                    : `${monthData.pendingCount} txns`}
                </span>
              </div>
            )}

            <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-slate-200 font-bold">
              <span>Total Collections:</span>
              <span>
                {metricType === 'revenue'
                  ? `₦${(monthData?.total || 0).toLocaleString('en-NG')}`
                  : `${monthData?.totalCount || 0} txns`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-green/10 text-brand-green rounded-md">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
              Monthly Revenue & Fee Collections Trend
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              UBA Account #1027146728
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track tuition inflows, boarding remittances, and PTA fee trends over the academic calendar.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar vs Academic Year Toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('academic')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'academic'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Academic Year (Sep-Aug)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Calendar (Jan-Dec)
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetricType('revenue')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                metricType === 'revenue'
                  ? 'bg-brand-green text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Revenue (₦)
            </button>
            <button
              type="button"
              onClick={() => setMetricType('volume')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                metricType === 'volume'
                  ? 'bg-brand-green text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Txn Count
            </button>
          </div>

          {/* Year Filter */}
          {availableYears.length > 1 && (
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-green"
            >
              <option value="all">All Sessions</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr} Session</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Collections</span>
          </div>
          <p className="text-base font-black font-mono text-emerald-900">
            ₦{stats.totalVerified.toLocaleString('en-NG')}
          </p>
          <span className="text-[10px] text-emerald-700 block">
            {stats.verificationRate}% reconciled & verified
          </span>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Inflow</span>
          </div>
          <p className="text-base font-black font-mono text-amber-900">
            ₦{stats.totalPending.toLocaleString('en-NG')}
          </p>
          <span className="text-[10px] text-amber-700 block">Awaiting bursary audit</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
            <span>Peak Collection Month</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate" title={stats.peakMonth.name}>
            {stats.peakMonth.name.split('(')[0]}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">
            ₦{stats.peakMonth.amount.toLocaleString('en-NG')}
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-brand-green" />
            <span>Monthly Run-Rate</span>
          </div>
          <p className="text-base font-black font-mono text-slate-800">
            ₦{Math.round(stats.monthlyAverage).toLocaleString('en-NG')}
          </p>
          <span className="text-[10px] text-slate-500 block">Average active collection</span>
        </div>
      </div>

      {/* Main Recharts Bar Chart */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(val: number) => {
                if (metricType === 'revenue') {
                  if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `₦${(val / 1000).toFixed(0)}k`;
                  return `₦${val}`;
                }
                return `${val}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              formatter={(value: string) => {
                if (value === 'verified' || value === 'verifiedCount') return <span className="text-slate-700 font-bold">Verified Inflow</span>;
                if (value === 'pending' || value === 'pendingCount') return <span className="text-slate-700 font-bold">Pending Inflow</span>;
                return value;
              }}
            />
            {metricType === 'revenue' ? (
              <>
                <Bar
                  dataKey="verified"
                  name="verified"
                  fill="#15803d"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  dataKey="pending"
                  name="pending"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={42}
                />
              </>
            ) : (
              <>
                <Bar
                  dataKey="verifiedCount"
                  name="verifiedCount"
                  fill="#15803d"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  dataKey="pendingCount"
                  name="pendingCount"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={42}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-green inline-block"></span>
          <span>Green = Confirmed UBA receipts credited</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block ml-2"></span>
          <span>Amber = Unaudited bank teller or transfer slips</span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Updated in real-time from Bursary payments ledger
        </div>
      </div>
    </div>
  );
};
