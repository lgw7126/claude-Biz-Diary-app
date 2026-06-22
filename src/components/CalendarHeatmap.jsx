import { useState, useMemo } from 'react'
import { formatDate } from '../lib/dayType'

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️',
}

function getHeatColor(ratio) {
  if (ratio === 0) return 'bg-gray-100 text-gray-400'
  if (ratio < 0.2) return 'bg-indigo-100 text-indigo-900'
  if (ratio < 0.4) return 'bg-indigo-200 text-indigo-900'
  if (ratio < 0.6) return 'bg-indigo-400 text-white'
  if (ratio < 0.8) return 'bg-indigo-600 text-white'
  return 'bg-indigo-800 text-white'
}

export default function CalendarHeatmap({ entries }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedEntry, setSelectedEntry] = useState(null)

  const entryMap = useMemo(() => {
    const map = {}
    entries.forEach((e) => { map[e.date] = e })
    return map
  }, [entries])

  const monthEntries = useMemo(() =>
    entries.filter((e) => {
      const d = new Date(e.date + 'T12:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    }),
    [entries, year, month]
  )

  const maxRevenue = useMemo(() =>
    Math.max(...monthEntries.map((e) => e.revenue || 0), 1),
    [monthEntries]
  )

  const totalRevenue = monthEntries.reduce((s, e) => s + (e.revenue || 0), 0)
  const avgRevenue = monthEntries.length ? Math.round(totalRevenue / monthEntries.length) : 0
  const recordDays = monthEntries.length
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const firstDay = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay })

  const todayStr = today.toISOString().split('T')[0]

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (year === today.getFullYear() && month === today.getMonth()) return
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  return (
    <div className="space-y-4">
      {/* 월 내비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
        >
          ◀
        </button>
        <div className="text-lg font-black text-gray-900">
          {year}년 {month + 1}월
        </div>
        <button
          onClick={nextMonth}
          disabled={year === today.getFullYear() && month === today.getMonth()}
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30"
        >
          ▶
        </button>
      </div>

      {/* 월 요약 통계 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <div className="text-xs text-indigo-500 font-bold">월 합계</div>
          <div className="text-sm font-black text-indigo-900 mt-0.5">
            {totalRevenue >= 1000000
              ? `${(totalRevenue / 10000).toFixed(0)}만`
              : totalRevenue.toLocaleString()}
            원
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <div className="text-xs text-purple-500 font-bold">일 평균</div>
          <div className="text-sm font-black text-purple-900 mt-0.5">
            {avgRevenue >= 10000
              ? `${(avgRevenue / 10000).toFixed(1)}만`
              : avgRevenue.toLocaleString()}
            원
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-xs text-green-500 font-bold">기록 일수</div>
          <div className="text-sm font-black text-green-900 mt-0.5">
            {recordDays}/{daysInMonth}일
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const entry = entryMap[dateStr]
          const isToday = dateStr === todayStr
          const isSelected = selectedEntry?.date === dateStr
          const ratio = entry ? entry.revenue / maxRevenue : 0
          const colorClass = getHeatColor(ratio)

          return (
            <button
              key={day}
              onClick={() => {
                if (entry) setSelectedEntry(entry === selectedEntry ? null : entry)
              }}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all
                ${colorClass}
                ${isToday ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}
                ${isSelected ? 'ring-2 ring-offset-1 ring-amber-400' : ''}
                ${entry ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
              `}
            >
              <span className={`text-xs font-medium ${isToday ? 'font-black' : ''}`}>
                {day}
              </span>
              {entry && (
                <span className="text-[9px] opacity-80 mt-0.5 leading-none">
                  {entry.revenue >= 1000000
                    ? `${Math.round(entry.revenue / 10000)}만`
                    : entry.revenue >= 10000
                    ? `${Math.round(entry.revenue / 1000)}천`
                    : `${entry.revenue}`}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1.5 justify-end text-xs text-gray-400">
        <span>낮음</span>
        {['bg-indigo-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600', 'bg-indigo-800'].map(
          (c, i) => <div key={i} className={`w-4 h-4 rounded ${c}`} />
        )}
        <span>높음</span>
      </div>

      {/* 선택된 날짜 상세 */}
      {selectedEntry && (
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-bold text-indigo-900">{formatDate(selectedEntry.date)}</div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="text-2xl font-black text-indigo-800">
            {selectedEntry.revenue?.toLocaleString()}원
          </div>
          {selectedEntry.weather && (
            <div className="text-sm text-gray-500">
              {WEATHER_ICONS[selectedEntry.weather.condition] || '🌡️'}{' '}
              {selectedEntry.weather.description} {selectedEntry.weather.temp}°C
            </div>
          )}
          {selectedEntry.special_events?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedEntry.special_events.map((ev) => (
                <span key={ev} className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                  {ev}
                </span>
              ))}
            </div>
          )}
          {selectedEntry.ai_analysis?.comment && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 leading-relaxed">
              {selectedEntry.ai_analysis.comment}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
