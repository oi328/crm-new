import React from 'react'
import Layout from '../../../../components/Layout'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import SaveButton from '../components/SaveButton'
import ModulesToggleList from '../components/ModulesToggleList'
import { useCompanySetup } from '../store/CompanySetupContext'

export default function ModulesPage() {
  const { companySetup, toggleModule } = useCompanySetup()

  return (
    <Layout>
      <div className="company-setup-page p-3 sm:p-4">
        <PageHeader title="Modules Activation" description="Enable or disable modules" />
        <Card>
          <ModulesToggleList enabledModules={companySetup.enabledModules} onToggle={toggleModule} />
        </Card>
        <SaveButton onClick={() => {}} />
      </div>
    </Layout>
  )
}