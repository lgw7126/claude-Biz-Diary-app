import { useMemo } from 'react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { getDayTypeLabel, formatDate } from '../lib/dayType'

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️',
}

const TREND_CONFIG = {
  up: { icon: '📈', color: 'text-green-600' },
  down: { icon: '📉', color: 'text-red-600' },
  stable: { icon: '➡️', color: 'text-blue-600' },
}

export default function DiaryHistory({ entries }) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  )

  const chartData = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((e) => ({
        date: e.date.slice(5).replace('-', '/'),
        revenue: e.revenue,
      }))
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">📖</div>
        <div className="font-medium">아직 기록이 없어요</div>
        <div className="text-sm mt-1">오늘 매출을 첫 번째로 입력해보세요!</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 7일 미니 차트 */}
      {chartData.length > 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-3">최근 7일 매출 추이</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={chartData} barCategoryGap="25%">
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === chartData.length - 1 ? '#4f46e5' : '#c7d2fe'}
                  />
                ))}
              </Bar>
              <Tooltip
                formatter={(v) => [`${v.toLocaleString()}원`, '매출']}
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e0e7ff' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 기록 목록 */}
      <div className="space-y-2">
        {sorted.map((entry) => {
          const trend = TREND_CONFIG[entry.ai_analysis?.trend] || TREND_CONFIG.stable
          return (
            <div
              key={entry.id}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">{formatDate(entry.date)}</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {entry.revenue?.toLocaleString()}원
                  </div>
                  {entry.ai_analysis?.comment && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {entry.ai_analysis.comment}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-lg ${trend.color}`}>{trend.icon}</span>
                  {entry.weather && (
                    <span className="text-lg">{WEATHER_ICONS[entry.weather.condition] || '🌡️'}</span>
                  )}
                  {entry.day_type && (
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                      entry.day_type === 'holiday' ? 'bg-red-50 text-red-500' :
                      entry.day_type === 'weekend' ? 'bg-blue-50 text-blue-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {getDayTypeLabel(entry.day_type)}
                    </span>
                  )}
                </div>
              </div>
              {entry.special_events?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.special_events.map((ev) => (
                    <span
                      key={ev}
                      className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
