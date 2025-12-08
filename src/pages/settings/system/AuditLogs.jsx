import React from 'react'
import Layout from '../../../components/Layout'

export default function AuditLogs() {
  return (
    <Layout title="Audit Logs">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-3">Audit Logs</h1>
        <p className="text-sm text-[var(--muted-text)]">Review system changes and activities.</p>
      </div>
    </Layout>
  )
}