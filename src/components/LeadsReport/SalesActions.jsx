import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TeamDetailsModal from './TeamDetailsModal'
import KpiCard from './KpiCard'
import BarChartCard from './BarChartCard'
import DataTable from './DataTable'
import SummaryCard from './SummaryCard'
import { LuCalendarCheck, LuDollarSign, LuPhone, LuUsers, LuEye } from 'react-icons/lu'

const SalesActions = ({ reservationData = [], callsData = [], teamsData = [], totalAccounts = 0, lastUpdate, onUpdate }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const totalReservations = reservationData.length
  const totalReservationRevenue = useMemo(() => reservationData.reduce((sum, r) => sum + (r.revenue || 0), 0), [reservationData])
  const totalCalls = useMemo(() => callsData.reduce((sum, c) => sum + (c.value || 0), 0), [callsData])
  const topTeam = useMemo(() => {
    const sorted = [...teamsData].sort((a, b) => (b.accounts || 0) - (a.accounts || 0))
    return sorted[0] || null
  }, [teamsData])

  const callsMax = useMemo(() => {
    const vals = callsData.map(c => c.value || 0)
    return Math.max(100, ...vals)
  }, [callsData])

  // Derived metrics for redesigned KPIs
  const followUpsCount = useMemo(() => callsData.filter(c => /follow/i.test(c?.name || '')).reduce((s, c) => s + (c.value || 0), 0), [callsData])
  const meetingsCount = useMemo(() => callsData.filter(c => /(meeting|visit)/i.test(c?.name || '')).reduce((s, c) => s + (c.value || 0), 0), [callsData])
  const totalActions = useMemo(() => totalCalls + followUpsCount + meetingsCount, [totalCalls, followUpsCount, meetingsCount])
  const conversionRateStr = useMemo(() => {
    if (totalCalls > 0) return `${Math.round((totalReservations / totalCalls) * 100)}%`
    return typeof topTeam?.conversion === 'string' ? topTeam.conversion : '—'
  }, [totalReservations, totalCalls, topTeam])

  // Filters removed per request; using global page context only

  return (
    <div className="space-y-6 my-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('Sales Actions Overview')}</h2>
      </div>

      {/* Filters removed */}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <KpiCard label={t('Total Actions')} value={totalActions} tone="default" icon={<LuUsers />} tooltip="All tracked actions" />
        <KpiCard label={t('Calls Made')} value={totalCalls} tone="warning" icon={<LuPhone />} tooltip="Total calls count" />
        <KpiCard label={t('Follow-ups Done')} value={followUpsCount} tone="info" icon={<LuCalendarCheck />} tooltip="Follow-up actions" />
        <KpiCard label={t('Meetings Scheduled')} value={meetingsCount} tone="success" icon={<LuCalendarCheck />} tooltip="Meetings count" />
        <KpiCard label={t('Conversion Rate %')} value={conversionRateStr} tone="success" icon={<LuDollarSign />} tooltip="Leads converted vs calls" />
      </div>

      {/* Calls Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChartCard title={t('Action Distribution')} subtitle={t('By type')} data={callsData} />
          <div className="mt-4">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition" onClick={() => navigate('/reports/activity')}>
              {t('View Detailed Activity Report')}
            </button>
          </div>
        </div>

        {/* Top Team */}
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">{t('salesActions.topTeam')}</h3>
          </div>
          {topTeam ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-400">{topTeam.team}</div>
              <div className="text-2xl font-bold text-green-400">{topTeam.accounts} {t('salesActions.accounts')}</div>
              <div className="text-xs text-gray-400" title="Conversion Rate">{t('Conversion')}: {topTeam.conversion}</div>
              <div>
                <button
                  className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
                  onClick={() => navigate(`/reports/team?team=${encodeURIComponent(topTeam.team)}&manager=All`)}
                >
                  {t('salesActions.viewTeamDetails')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">{t('salesActions.noTeamData')}</div>
          )}
        </div>
      </div>

      {/* Teams Leaderboard */}
      <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">{t('salesActions.leaderboard')}</h3>
          <span className="text-xs text-gray-400">{t('salesActions.byAccounts')}</span>
        </div>
        <DataTable
          columns={[t('Rank'), t('Team'), t('salesActions.accounts'), t('Conversion Rate'), t('Details')]}
          align={['right', 'left', 'right', 'right', 'left']}
          rows={teamsData.map(teamRow => [
            teamRow.rank,
            (
              <button
                key={`team-${teamRow.team}`}
                className="text-blue-400 hover:underline"
                onClick={() => { setSelectedTeam({ name: teamRow.team }); setShowTeamModal(true) }}
              >
                {teamRow.team}
              </button>
            ),
            teamRow.accounts,
            teamRow.conversion,
            (
              <button
                key={`btn-${teamRow.team}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition text-xs"
                onClick={() => navigate(`/reports/team?team=${encodeURIComponent(teamRow.team)}&manager=All`)}
                title={t('Details')}
              >
                <LuEye className="text-gray-200" />
              </button>
            )
          ])}
        />
      </div>

      {/* Recent Reservations Summary */}
      <SummaryCard title={t('salesActions.monthlyReservationsSummary')} subtitle={t('salesActions.lastMonths', { months: Math.min(6, reservationData.length) })} data={reservationData} />
      {showTeamModal && (
        <TeamDetailsModal onClose={() => setShowTeamModal(false)} team={selectedTeam} />
      )}
    </div>
  )
}

export default SalesActions