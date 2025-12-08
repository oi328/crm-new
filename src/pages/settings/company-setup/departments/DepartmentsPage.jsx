import React from 'react'
import Layout from '../../../../components/Layout'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import SaveButton from '../components/SaveButton'
import DepartmentsTable from '../components/DepartmentsTable'
import { useCompanySetup } from '../store/CompanySetupContext'

export default function DepartmentsPage() {
  const { companySetup, addDepartment, updateDepartment } = useCompanySetup()
  const onDelete = (id) => alert(`Delete ${id} (mock)`) // could update context as well

  return (
    <Layout>
      <div className="company-setup-page p-3 sm:p-4">
        <PageHeader title="Departments" description="Manage departments and roles" />
        <Card>
          <DepartmentsTable departments={companySetup.departments} onAdd={addDepartment} onUpdate={updateDepartment} onDelete={onDelete} />
        </Card>
        <SaveButton onClick={() => {}} />
      </div>
    </Layout>
  )
}