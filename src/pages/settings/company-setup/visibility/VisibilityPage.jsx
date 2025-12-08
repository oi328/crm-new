import React from 'react'
import Layout from '../../../../components/Layout'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import SaveButton from '../components/SaveButton'
import VisibilityMatrix from '../components/VisibilityMatrix'
import { useCompanySetup } from '../store/CompanySetupContext'

export default function VisibilityPage() {
  const { companySetup, updateVisibility } = useCompanySetup()

  return (
    <Layout>
      <div className="company-setup-page p-3 sm:p-4">
        <PageHeader title="Visibility Matrix" description="Assign module access per department" />
        <Card>
          <VisibilityMatrix departments={companySetup.departments} visibility={companySetup.visibility} onChange={updateVisibility} />
        </Card>
        <SaveButton onClick={() => updateVisibility(companySetup.visibility)} />
      </div>
    </Layout>
  )
}