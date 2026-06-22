import { useState, useEffect } from 'react'
import { getWeather } from '../lib/weather'
import { getDayType, getDayTypeLabel, formatDate, getToday } from '../lib/dayType'

const SPECIAL_EVENTS = [
  { id: '비가왔어요', icon: '🌧️', label: '비가왔어요' },
  { id: '근처행사', icon: '🎪', label: '근처행사' },
  { id: '직원결근', icon: '😓', label: '직원결근' },
  { id: '메뉴변경', icon: '📋', label: '메뉴변경' },
  { id: '공휴일', icon: '🎌', label: '공휴일' },
  { id: '기타', icon: '📝', label: '기타' },
]

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
}

export default function SalesInput({ onSave, existingEntry }) {
  const today = getToday()
  const dayType = getDayType(today)

  const [revenue, setRevenue] = useState(
    existingEntry ? existingEntry.revenue.toLocaleString('ko-KR') : ''
  )
  const [notes, setNotes] = useState(existingEntry?.notes || '')
  const [selectedEvents, setSelectedEvents] = useState(existingEntry?.special_events || [])
  const [weather, setWeather] = useState(existingEntry?.weather || null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!existingEntry?.weather) {
      setWeatherLoading(true)
      getWeather()
        .then(setWeather)
        .catch(console.error)
        .finally(() => setWeatherLoading(false))
    }
  }, [])

  const toggleEvent = (id) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const formatRevenue = (val) => {
    const num = val.replace(/[^0-9]/g, '')
    return num ? parseInt(num, 10).toLocaleString('ko-KR') : ''
  }

  const handleSubmit = async () => {
    const raw = parseInt(revenue.replace(/,/g, ''), 10)
    if (!raw || raw <= 0) return

    setIsSubmitting(true)
    try {
      await onSave({
        date: today,
        revenue: raw,
        notes,
        special_events: selectedEvents,
        day_type: dayType,
        weather,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const dayLabel = { weekday: '오늘', weekend: '주말', holiday: '공휴일' }[dayType]

  return (
    <div className="space-y-5">
      {/* 날짜 & 날씨 헤더 */}
      <div className="bg-indigo-50 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-indigo-500 font-medium">{formatDate(today)}</div>
          <div className="text-base font-bold text-indigo-900 mt-0.5">
            {dayLabel} 매출을 입력해주세요
          </div>
          <div className="mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              dayType === 'holiday' ? 'bg-red-100 text-red-600' :
              dayType === 'weekend' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-500'
            }`}>
              {getDayTypeLabel(dayType)}
            </span>
          </div>
        </div>
        <div className="text-right">
          {weatherLoading ? (
            <div className="text-2xl animate-pulse">🌡️</div>
          ) : weather ? (
            <div>
              <div className="text-2xl">{WEATHER_ICONS[weather.condition] || '🌡️'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{weather.temp}°C</div>
              <div className="text-xs text-gray-400">{weather.description}</div>
            </div>
          ) : (
            <div className="text-2xl text-gray-300">🌡️</div>
          )}
        </div>
      </div>

      {/* 매출 입력 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">오늘 매출 💰</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={revenue}
            onChange={(e) => setRevenue(formatRevenue(e.target.value))}
            placeholder="0"
            className="w-full text-right text-3xl font-black border-2 border-gray-200 rounded-xl px-4 py-4 pr-12 focus:border-indigo-400 focus:outline-none tracking-tight"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
            원
          </span>
        </div>
      </div>

      {/* 특이사항 — PRD 버전 6개 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          특이사항이 있었나요?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SPECIAL_EVENTS.map((event) => (
            <button
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className={`py-3 px-2 rounded-xl text-center transition-all ${
                selectedEvents.includes(event.id)
                  ? 'bg-indigo-600 text-white shadow-md scale-[0.98]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-xl mb-1">{event.icon}</div>
              <div className="text-xs font-medium">{event.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          오늘 메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘 장사 어땠어요? 자유롭게 적어보세요..."
          rows={3}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none resize-none"
        />
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={!revenue || isSubmitting}
        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        {isSubmitting
          ? '저장 중...'
          : existingEntry
          ? '오늘 기록 수정하기'
          : '오늘 기록 저장하기 ✓'}
      </button>
    </div>
  )
}
