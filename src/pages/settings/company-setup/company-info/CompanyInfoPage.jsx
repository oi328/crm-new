import React from 'react'
import Layout from '../../../../components/Layout'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import SaveButton from '../components/SaveButton'
import CompanyInfoForm from '../components/CompanyInfoForm'
import { useCompanySetup } from '../store/CompanySetupContext'

export default function CompanyInfoPage() {
  const { companySetup, updateCompanyInfo } = useCompanySetup()

  return (
    <Layout>
      <div className="company-setup-page p-3 sm:p-4">
        <PageHeader title="Company Information" description="Set basic details and logo" />
        <Card>
          <CompanyInfoForm initial={companySetup.companyInfo} onChange={updateCompanyInfo} />
        </Card>
        <SaveButton onClick={() => updateCompanyInfo(companySetup.companyInfo)} />
      </div>
    </Layout>
  )
}