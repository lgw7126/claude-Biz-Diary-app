import { useState, useEffect, useCallback } from 'react'
import SalesInput from './components/SalesInput'
import AnalysisResult from './components/AnalysisResult'
import CalendarHeatmap from './components/CalendarHeatmap'
import DiaryHistory from './components/DiaryHistory'
import { fetchEntries, upsertEntry } from './lib/supabase'
import { analyzeEntry } from './lib/claude'
import { getToday } from './lib/dayType'

const TABS = [
  { id: 'today', icon: '📝', label: '오늘' },
  { id: 'calendar', icon: '📅', label: '캘린더' },
  { id: 'history', icon: '📖', label: '기록' },
]

const BUSINESS_TYPES = ['식당', '카페', '미용실', '편의점', '의류', '기타']

function calculateStreak(entries) {
  if (!entries.length) return 0
  const dates = new Set(entries.map((e) => e.date))
  let streak = 0
  const d = new Date()
  while (true) {
    const str = d.toISOString().split('T')[0]
    if (dates.has(str)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState(null)
  const [businessType, setBusinessType] = useState(
    () => localStorage.getItem('businessType') || '식당'
  )

  const today = getToday()
  const todayEntry = entries.find((e) => e.date === today)
  const streak = calculateStreak(entries)
  const showInput = !todayEntry || isEditMode

  const loadEntries = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchEntries(90)
      setEntries(data)
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다. 환경변수를 확인해주세요.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleBusinessTypeChange = (type) => {
    setBusinessType(type)
    localStorage.setItem('businessType', type)
  }

  const handleSave = async (entryData) => {
    try {
      // 즉시 저장
      const saved = await upsertEntry(entryData)
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.date !== today)
        return [saved, ...filtered]
      })
      setIsEditMode(false)

      // AI 분석 (비동기)
      setIsAnalyzing(true)
      const history = entries.filter((e) => e.date !== today).slice(0, 7)

      try {
        const analysis = await analyzeEntry(entryData, history, businessType)
        const updated = await upsertEntry({ ...saved, ai_analysis: analysis })
        setEntries((prev) => {
          const filtered = prev.filter((e) => e.date !== today)
          return [updated, ...filtered]
        })
      } catch (err) {
        console.error('AI analysis failed:', err)
      } finally {
        setIsAnalyzing(false)
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (err) {
      console.error('Save failed:', err)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-lg">
          <div className="text-4xl mb-4">⚙️</div>
          <h2 className="text-lg font-black text-gray-900 mb-2">환경변수 설정 필요</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            루트 폴더에 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600">.env</code> 파일을 만들고 아래 값을 설정하세요.
          </p>
          <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs text-left leading-relaxed">
{`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_OPENWEATHER_API_KEY=...`}
          </pre>
          <p className="text-xs text-gray-400 mt-3">자세한 내용은 .env.example 참고</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-400">불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-lg font-black text-indigo-900">오늘 장사 어땠어요?</h1>
            <p className="text-xs text-gray-400">
              {businessType} · 매일 기록하는 스마트 경영 일기
            </p>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
                <span>🔥</span>
                <span className="text-sm font-black">{streak}</span>
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 업종 설정 패널 */}
      {showSettings && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="text-xs font-bold text-gray-500 mb-2">업종 설정</div>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleBusinessTypeChange(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  businessType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 성공 토스트 */}
      {showSuccess && (
        <div className="mx-4 mt-3 bg-green-500 text-white rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg">
          <span className="text-xl">🎉</span>
          <div>
            <div className="text-sm font-bold">오늘도 기록했어요!</div>
            <div className="text-xs opacity-90">{streak}일 연속 달성 중이에요 🔥</div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-4 mt-3 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'today' &&
          (showInput ? (
            <SalesInput
              onSave={handleSave}
              existingEntry={isEditMode ? todayEntry : null}
            />
          ) : (
            <AnalysisResult
              entry={todayEntry}
              onEdit={() => setIsEditMode(true)}
              streak={streak}
              isAnalyzing={isAnalyzing}
            />
          ))}

        {activeTab === 'calendar' && <CalendarHeatmap entries={entries} />}

        {activeTab === 'history' && <DiaryHistory entries={entries} />}
      </main>

      {/* 하단 탭 */}
      <nav className="bg-white border-t border-gray-100 pb-safe">
        <div className="grid grid-cols-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setShowSettings(false)
              }}
              className={`py-3 flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-xs ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
