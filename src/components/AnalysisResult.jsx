import { getDayTypeLabel, formatDate } from '../lib/dayType'

const TREND_CONFIG = {
  up: { icon: '📈', label: '상승', color: 'text-green-700', bg: 'bg-green-100' },
  down: { icon: '📉', label: '하락', color: 'text-red-700', bg: 'bg-red-100' },
  stable: { icon: '➡️', label: '보합', color: 'text-blue-700', bg: 'bg-blue-100' },
}

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
}

export default function AnalysisResult({ entry, onEdit, streak, isAnalyzing }) {
  if (!entry) return null

  const analysis = entry.ai_analysis || {}
  const trend = TREND_CONFIG[analysis.trend] || TREND_CONFIG.stable
  const weather = entry.weather || {}

  return (
    <div className="space-y-4">
      {/* 날짜 + 스트릭 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{formatDate(entry.date)}</div>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-3 py-1.5">
            <span>🔥</span>
            <span className="text-sm font-black">{streak}일 연속</span>
          </div>
        )}
      </div>

      {/* 매출 카드 */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="text-sm opacity-75 mb-1">오늘 매출</div>
        <div className="text-4xl font-black mb-3">
          {entry.revenue?.toLocaleString('ko-KR')}
          <span className="text-xl font-medium ml-1 opacity-80">원</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 ${trend.bg} ${trend.color} rounded-full px-3 py-1`}>
            <span>{trend.icon}</span>
            <span className="text-sm font-bold">{trend.label}</span>
          </div>
          {entry.day_type && (
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
              {getDayTypeLabel(entry.day_type)}
            </div>
          )}
        </div>
      </div>

      {/* AI 분석 */}
      {isAnalyzing ? (
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-indigo-700 font-medium">
              AI가 오늘 장사를 분석하고 있어요...
            </span>
          </div>
        </div>
      ) : analysis.comment ? (
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <span>🤖</span>
            <span className="text-sm font-bold text-indigo-700">AI 분석</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.comment}</p>
          {analysis.reason && (
            <div className="mt-2 pt-2 border-t border-indigo-100 text-xs text-indigo-600 font-medium">
              💡 {analysis.reason}
            </div>
          )}
        </div>
      ) : null}

      {/* 날씨 + 특이사항 */}
      <div className="grid grid-cols-2 gap-3">
        {weather.temp !== undefined && (
          <div className="bg-sky-50 rounded-xl p-3">
            <div className="text-xs text-sky-600 font-bold mb-1.5">날씨</div>
            <div className="text-2xl">{WEATHER_ICONS[weather.condition] || '🌡️'}</div>
            <div className="text-sm font-bold text-sky-900 mt-1">{weather.temp}°C</div>
            <div className="text-xs text-sky-500">{weather.description}</div>
          </div>
        )}
        {entry.special_events?.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="text-xs text-amber-600 font-bold mb-1.5">특이사항</div>
            <div className="flex flex-wrap gap-1">
              {entry.special_events.map((ev) => (
                <span
                  key={ev}
                  className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5"
                >
                  {ev}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 메모 */}
      {entry.notes && (
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 font-bold mb-1">메모</div>
          <p className="text-sm text-gray-700">{entry.notes}</p>
        </div>
      )}

      {/* 수정 버튼 */}
      <button
        onClick={onEdit}
        className="w-full py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        오늘 기록 수정하기
      </button>
    </div>
  )
}
