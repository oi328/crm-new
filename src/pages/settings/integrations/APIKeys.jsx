import React from 'react'
import Layout from '../../../components/Layout'

export default function APIKeys() {
  return (
    <Layout title="API Keys">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-3">API Keys</h1>
        <p className="text-sm text-[var(--muted-text)]">Manage API keys for integrations.</p>
      </div>
    </Layout>
  )
}