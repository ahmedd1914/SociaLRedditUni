import React from 'react';
import toast from 'react-hot-toast';
import { IconType } from 'react-icons';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  Line,
  Bar,
  Pie,
  Area,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * If you know the shape of your "chartData", "chartPieData", etc.,
 * you can replace 'object[]' with more specific types. For example:
 * 
 * interface BarLineData {
 *   name: string;
 *   value: number;
 * }
 * 
 * interface PieData {
 *   name: string;
 *   value: number;
 *   color: string;
 * }
 * 
 * interface AreaData {
 *   name: string;
 *   smartphones: number;
 *   consoles: number;
 *   laptops: number;
 *   others: number;
 * }
 */

interface ChartBoxProps {
  chartType: 'line' | 'bar' | 'area' | 'pie'; // possible chart types
  color?: string;
  IconBox?: IconType;
  title?: string;
  dataKey?: string;
  number?: number | string;
  percentage?: number;
  
  // For line/bar charts:
  data?: object[]; 
  
  // For pie charts:
  chartPieData?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  
  // For area charts:
  chartAreaData?: Array<{
    name: string;
    smartphones: number;
    consoles: number;
    laptops: number;
    others: number;
  }>;

  isLoading?: boolean;
  isSuccess?: boolean;
}

const ChartBox: React.FC<ChartBoxProps> = ({
  chartType,
  color,
  IconBox,
  title,
  dataKey,
  number,
  percentage,
  data,
  chartPieData,
  chartAreaData,
  isLoading,
  isSuccess,
}) => {
  // ---------------------------
  // 1) LINE CHART
  // ---------------------------
  if (chartType === 'line') {
    if (isLoading) {
      return (
        <div className="w-full h-full flex justify-between items-end xl:gap-5">
          {/* Skeleton/Loading State */}
          <div className="flex h-full flex-col justify-between items-start">
            <div className="flex items-center gap-2">
              {IconBox && (
                <IconBox className="m-0 p-0 text-[24px] xl:text-[30px] 2xl:text-[42px]" />
              )}
              <span className="w-[88px] xl:w-[60px] 2xl:w-[82px] text-[16px] xl:text-[15px] 2xl:text-[20px] font-semibold">
                {title}
              </span>
            </div>
            <div className="skeleton w-16 h-6"></div>
            <div className="skeleton w-12 h-4"></div>
          </div>
          <div className="flex h-full grow flex-col justify-between items-end">
            <div className="skeleton w-20 h-10"></div>
            <div className="skeleton w-16 h-6"></div>
          </div>
        </div>
      );
    }

    if (isSuccess && data) {
      return (
        <div className="w-full h-full flex justify-between items-end xl:gap-5">
          <div className="flex h-full flex-col justify-between items-start">
            <div className="flex items-center gap-2">
              {IconBox && (
                <IconBox className="text-[24px] xl:text-[30px] 2xl:text-[42px] 3xl:text-[48px]" />
              )}
              <span className="w-[88px] xl:w-[60px] 2xl:w-[82px] 3xl:w-[140px] text-[16px] xl:text-[15px] 2xl:text-[20px] 3xl:text-[24px] font-semibold">
                {title}
              </span>
            </div>
            <span className="font-bold text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl">
              {number}
            </span>
            <button
              onClick={() => toast('Ngapain?', { icon: '😋' })}
              className="btn btn-link px-0 py-0 min-h-0 max-h-5 font-medium text-base-content no-underline"
            >
              View All
            </button>
          </div>
          <div className="flex h-full grow flex-col justify-between items-end">
            <div className="w-full h-full xl:h-[60%]">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={data}>
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: color,
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ display: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex xl:flex-col 2xl:flex-row gap-2 items-end xl:items-end 2xl:items-center">
              <span
                className={`${
                  percentage && percentage > 0 ? 'text-success' : 'text-error'
                } text-2xl xl:text-xl 2xl:text-3xl font-bold`}
              >
                {percentage || ''}%
              </span>
              <span className="font-medium xl:text-sm 2xl:text-base">
                this month
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null; // if not loading and not success
  }

  // ---------------------------
  // 2) BAR CHART
  // ---------------------------
  if (chartType === 'bar') {
    if (isLoading) {
      return (
        <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-3 xl:gap-4">
          <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
            {title || 'No title'}
          </span>
          <div className="w-full min-h-40 xl:min-h-[150px] skeleton"></div>
        </div>
      );
    }

    if (isSuccess && data) {
      return (
        <div className="w-full h-full p-0 m-0 flex flex-col items-start 3xl:justify-between gap-3 xl:gap-4">
          <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
            {title || 'No title'}
          </span>
          <div className="w-full min-h-40 xl:min-h-[150px] 2xl:min-h-[180px] 3xl:min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar dataKey={dataKey || ''} fill={color || '#8884d8'} />
                <XAxis dataKey="name" />
                <Tooltip
                  contentStyle={{
                    background: color || '#8884d8',
                    borderRadius: '5px',
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ fill: 'none' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  }

  // ---------------------------
  // 3) PIE CHART
  // ---------------------------
  if (chartType === 'pie') {
    if (isLoading) {
      return (
        <div className="w-full h-full p-0 m-0 flex flex-col items-start justify-between gap-3 xl:gap-4">
          <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
            {title || 'no title'}
          </span>
          <div className="w-full min-h-[300px] skeleton"></div>
          <div className="w-full flex flex-col 2xl:flex-row justify-between gap-2 items-start 2xl:items-center 2xl:flex-wrap">
            <div className="skeleton w-full h-5"></div>
            <div className="skeleton w-full h-5"></div>
            <div className="skeleton w-full h-5"></div>
            <div className="skeleton w-full h-5"></div>
          </div>
        </div>
      );
    }

    if (isSuccess && chartPieData) {
      return (
        <div className="w-full h-full p-0 m-0 flex flex-col items-start justify-between gap-3 xl:gap-4">
          <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
            {title || 'no title'}
          </span>
          <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    borderRadius: '5px',
                  }}
                />
                <Pie
                  data={chartPieData}
                  innerRadius="70%"
                  outerRadius="90%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartPieData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full flex flex-col 2xl:flex-row justify-between gap-2 items-start 2xl:items-center 2xl:flex-wrap">
            {chartPieData.map((item) => (
              <div
                className="flex flex-row 2xl:flex-col gap-2 items-center"
                key={item.name}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span>({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }

  // ---------------------------
  // 4) AREA CHART
  // ---------------------------
  if (chartType === 'area') {
    if (isLoading) {
      return (
        <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
          <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
            {title || 'no title'}
          </span>
          <div className="w-full min-h-[300px] skeleton"></div>
        </div>
      );
    }

    if (isSuccess && chartAreaData) {
      return (
        <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
          <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
            {title || 'no title'}
          </span>
          <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartAreaData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="smartphones"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="consoles"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Area
                  type="monotone"
                  dataKey="laptops"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
                <Area
                  type="monotone"
                  dataKey="others"
                  stackId="1"
                  stroke="#969595"
                  fill="#969595"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  }

  // If chartType doesn't match any known type, return null
  return null;
};

export default ChartBox;
