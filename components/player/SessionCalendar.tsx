'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useEntitlements } from '@/hooks/useEntitlements'

interface DayData {
  date: string
  totalSeconds: number
  stacks: string[]
}

interface SessionCalendarProps {
  refreshKey?: number
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function SessionCalendar({ refreshKey }: SessionCalendarProps) {
  const { user } = useSupabaseUser()
  const { isPaid } = useEntitlements()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1) // 1-12
  const [sessions, setSessions] = useState<DayData[]>([])
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/session/history?year=${viewYear}&month=${viewMonth}`)
      if (res.ok) {
        const data = await res.json() as { sessions: DayData[] }
        setSessions(data.sessions)
      }
    } catch {}
  }, [user, viewYear, viewMonth])

  useEffect(() => { fetchSessions() }, [fetchSessions, refreshKey])

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const startDow = new Date(viewYear, viewMonth - 1, 1).getDay()
  const sessionMap = new Map(sessions.map(s => [s.date, s]))
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  if (!user) return null

  if (!isPaid) {
    return (
      <div className="relative rounded-xl border border-surface-border bg-surface-raised p-4 overflow-hidden">
        {/* Blurred ghost calendar */}
        <div className="select-none pointer-events-none blur-[3px] opacity-40" aria-hidden>
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded p-1"><svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></div>
            <span className="text-xs font-semibold text-gray-300">{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</span>
            <div className="rounded p-1"><svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-0.5 text-[10px] text-gray-600">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: new Date(now.getFullYear(), now.getMonth(), 1).getDay() }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }).map((_, i) => {
              const highlight = [2, 5, 8, 12, 15, 19, 22].includes(i)
              return (
                <div key={i} className="flex justify-center">
                  <div className={['flex h-6 w-6 items-center justify-center rounded-full text-[11px]', highlight ? 'bg-green-600/80 text-white font-semibold' : 'text-gray-500'].join(' ')}>{i + 1}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-raised/60 backdrop-blur-[1px]">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs font-semibold text-gray-300">Daily Tracking</p>
          <p className="text-[11px] text-gray-500 text-center px-4">See your listening streak and history</p>
          <Link
            href="/account/billing"
            className="mt-1 rounded-lg border border-brand-600/40 bg-brand-600/10 px-3 py-1.5 text-[11px] font-medium text-brand-400 hover:bg-brand-600/20 transition-colors"
          >
            Unlock with Starter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded p-1 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-gray-300">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="rounded p-1 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="py-0.5 text-[10px] text-gray-600">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`e${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const data = sessionMap.get(dateStr)
          const isToday = dateStr === todayStr

          return (
            <div
              key={dateStr}
              className="relative flex justify-center"
              onMouseEnter={() => data && setHoveredDay(dateStr)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className={[
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors',
                data
                  ? 'cursor-pointer bg-green-600/80 font-semibold text-white hover:bg-green-500'
                  : 'text-gray-500',
                isToday && !data ? 'ring-1 ring-gray-500' : '',
              ].join(' ')}>
                {day}
              </div>

              {/* Tooltip */}
              {hoveredDay === dateStr && data && (
                <div className="absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 rounded-lg border border-surface-border bg-surface-raised px-3 py-2 shadow-xl">
                  <div className="whitespace-nowrap text-xs font-semibold text-white">
                    {formatDuration(data.totalSeconds)} listened
                  </div>
                  {data.stacks.length > 0 && (
                    <div className="mt-0.5 max-w-[160px] truncate text-[11px] text-gray-400">
                      {data.stacks.join(', ')}
                    </div>
                  )}
                  {/* Caret */}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-surface-border" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
