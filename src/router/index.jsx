import React, { useEffect } from 'react' // 1. استورد useEffect
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Dashboard } from '@features/Dashboard'
import { Login } from '@features/Auth'
// Legacy pages kept as-is (to be moved incrementally)
import Customers from '../pages/Customers'
import Leads from '../pages/Leads'
import Recycle from '../pages/Recycle'
import AddNewLead from '../pages/AddNewLead'
import SalesOpportunities from '../pages/SalesOpportunities'
import SalesQuotations from '../pages/SalesQuotations'
import SalesOrders from '../pages/SalesOrders'
import SalesInvoices from '../pages/SalesInvoices'
import SupportDashboard from '../pages/SupportDashboard'
import SupportTickets from '../pages/SupportTickets'
import SupportCustomers from '../pages/SupportCustomers'
import SupportSLA from '../pages/SupportSLA'
import SupportReports from '../pages/SupportReports'
import SupportFeedbacks from '../pages/SupportFeedbacks'
import ThirdParties from '../pages/inventory/ThirdParties'
import GeneralRequests from '../pages/inventory/RequestsPage'
import RealEstateRequests from '../pages/inventory/RealEstateRequestsPage'
import RealEstatePriceBooks from '../pages/inventory/RealEstatePriceBooks'
import Projects from '../pages/Projects'
import Properties from '../pages/Properties'
import Requests from '../pages/Requests'
import BuyerRequests from '../pages/BuyerRequests'
import SellerRequests from '../pages/SellerRequests'
import Marketing from '../pages/Marketing'
import Settings from '../pages/Settings'
import ProfileSettings from '../pages/settings/profile/ProfileSettings'
import CompanySettings from '../pages/settings/company/CompanySettings'
import ContactInfoSettings from '../pages/settings/contact-info/ContactInfoSettings'
import SystemPreferences from '../pages/settings/system/SystemPreferences'
import ModulesSettings from '../pages/settings/system/ModulesSettings'
import SecuritySettings from '../pages/settings/system/SecuritySettings'
import CustomFields from '../pages/settings/system/CustomFields'
import AuditLogs from '../pages/settings/system/AuditLogs'
import NotificationsSettings from '../pages/settings/notifications/NotificationsSettings'
import SMSTemplates from '../pages/settings/notifications/SMSTemplates'
import EmailTemplates from '../pages/settings/notifications/EmailTemplates'
import WhatsAppTemplates from '../pages/settings/notifications/WhatsAppTemplates'
import BillingSubscription from '../pages/settings/billing/BillingSubscription'
import PaymentHistory from '../pages/settings/billing/PaymentHistory'
import PlansUpgrade from '../pages/settings/billing/PlansUpgrade'
import APIKeys from '../pages/settings/integrations/APIKeys'
import Webhooks from '../pages/settings/integrations/Webhooks'
import WhatsAppIntegration from '../pages/settings/integrations/WhatsAppIntegration'
import PaymentGatewayIntegration from '../pages/settings/integrations/PaymentGatewayIntegration'
import GoogleSlackIntegrations from '../pages/settings/integrations/GoogleSlackIntegrations'
import ImportDM from '../pages/settings/data-management/Import'
import ExportDM from '../pages/settings/data-management/Export'
import Backup from '../pages/settings/data-management/Backup'
import Scripting from '../pages/settings/operations/Scripting'
import EOISettings from '../pages/settings/operations/EOISettings'
import ReservationSettings from '../pages/settings/operations/ReservationSettings'
import RotationSettings from '../pages/settings/operations/RotationSettings'
import ContractsSettings from '../pages/settings/operations/ContractsSettings'
import BuyerRequestReset from '../pages/settings/operations/BuyerRequestReset'
import MatchingSettings from '../pages/settings/operations/MatchingSettings'
import RentConfiguration from '../pages/settings/operations/RentConfiguration'
import CILSettings from '../pages/settings/operations/CILSettings'
import SettingsConfiguration from '../pages/SettingsConfiguration'
import StagesSetup from '../pages/StagesSetup'
import CancelReasons from '../pages/CancelReasons'
import PaymentPlans from '../pages/PaymentPlans'
import Products from '../pages/Products'
import ItemsPage from '../pages/inventory/ItemsPage'
import Categories from '../pages/Categories'
import Brokers from '../pages/inventory/Brokers'
import Developers from '../pages/inventory/Developers'
import StockManagement from '../pages/StockManagement'
import InventoryTransactions from '../pages/InventoryTransactions'
import Suppliers from '../pages/Suppliers'
import PriceBooks from '../pages/inventory/PriceBooks'
import Warehouse from '../pages/Warehouse'
import Campaigns from '../pages/Campaigns'
import LandingPages from '../pages/LandingPages'
import MetaIntegration from '../pages/MetaIntegration'
import MarketingReports from '../pages/MarketingReports'
import CampaignSummaryReport from '../pages/CampaignSummaryReport'
import LeadSourcePerformanceReport from '../pages/LeadSourcePerformanceReport'
import CostVsRevenueReport from '../pages/CostVsRevenueReport'
import MonthlyMarketingOverview from '../pages/MonthlyMarketingOverview'
import Reports from '../pages/Reports'
import ReportPlaceholder from '../pages/ReportPlaceholder'
import ContactUs from '../pages/ContactUs'
import Privacy from '../pages/Privacy'
import Terms from '../pages/Terms'
import WelcomeContact from '../pages/WelcomeContact'
import About from '../pages/About'
import AddLandingPage from '../pages/AddLandingPage'
import Tasks from '../pages/Tasks'
import Notifications from '../pages/Notifications'
import SalesReport from '../pages/SalesReport'
import LeadsReport from '../pages/LeadsReport'
import MeetingsReport from '../pages/MeetingsReport'
import ImportsReport from '../pages/ImportsReport'
import ExportsReport from '../pages/ExportsReport'
import SalesActivitiesReport from '../pages/SalesActivitiesReport'
import LeadsPipelineReport from '../pages/LeadsPipelineReport'
import ReservationsReport from '../pages/ReservationsReport'
import ClosedDealsReport from '../pages/ClosedDealsReport'
import RentReport from '../pages/RentReport'
import CheckInReport from '../pages/CheckInReport'
import CustomersReport from '../pages/CustomersReport'
import TeamPerformanceReport from '../pages/TeamPerformanceReport'
import ReportsDashboard from '../pages/ReportsDashboard'
import SubscriptionExpired from '../pages/SubscriptionExpired'
import UpgradePlan from '../pages/UpgradePlan'
import Welcome from '../pages/Welcome'
import Pricing from '../pages/Pricing'
import Layout from '../components/Layout'
import UserManagementUsers from '../features/Users/Users'
import UserManagementUserCreate from '../features/Users/UserForm'
import UserManagementActivityLogs from '../pages/UserManagementActivityLogs'
import UserManagementAccessLogs from '../pages/UserManagementAccessLogs'
import UserManagementRoles from '../pages/UserManagementRoles'
import UserManagementRoleEdit from '../pages/UserManagementRoleEdit'
import LandingPagePreview from '../pages/landing-themes/LandingPagePreview'
import LandingPageViewer from '../pages/landing-themes/LandingPageViewer'

function ProtectedModuleRoute() { return <Outlet /> }
function SubscriptionGuard() { return <Outlet /> }
function BillingAdminRoute() { return <Outlet /> }

export default function AppRouter() {
  const { i18n } = useTranslation()
  return (
    <div className={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/subscription-expired" element={<SubscriptionExpired />} />
        <Route path="/upgrade" element={<UpgradePlan />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/welcome/contact" element={<WelcomeContact />} />
        <Route path="/landing-preview" element={<LandingPagePreview />} />

        <Route element={<SubscriptionGuard />}>        
          <Route element={<Layout />}>        
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/support" element={<SupportDashboard />} />
            <Route path="/support/tickets" element={<SupportTickets />} />
            <Route path="/support/customers" element={<SupportCustomers />} />
            <Route path="/support/sla" element={<SupportSLA />} />
            <Route path="/support/reports" element={<SupportReports />} />
            <Route path="/support/feedbacks" element={<SupportFeedbacks />} />
            <Route path="/sales" element={<Navigate to="/sales/opportunities" replace />} />
            <Route path="/sales/opportunities" element={<SalesOpportunities />} />
            <Route path="/sales/quotations" element={<SalesQuotations />} />
            <Route path="/sales/orders" element={<SalesOrders />} />
            <Route path="/sales/invoices" element={<SalesInvoices />} />
            <Route element={<ProtectedModuleRoute moduleKey="leads" />}>          
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/new" element={<AddNewLead />} />
              <Route path="/recycle" element={<Recycle />} />
              <Route path="/stages-setup" element={<StagesSetup />} />
            </Route>

            {/* Inventory Module */}
            <Route path="/inventory/categories" element={<Categories />} />
            <Route path="/inventory/items" element={<ItemsPage />} />
            <Route path="/inventory/price-books" element={<PriceBooks />} />
            <Route path="/inventory/third-parties" element={<ThirdParties />} />
            <Route path="/inventory/suppliers" element={<Suppliers />} />
            <Route path="/inventory/warehouse" element={<Warehouse />} />
            <Route path="/inventory/stock-management" element={<StockManagement />} />
            <Route path="/inventory/transactions" element={<InventoryTransactions />} />
            <Route path="/inventory/products" element={<Products />} />
            
            {/* Real Estate Inventory */}
            <Route path="/inventory/projects" element={<Projects />} />
            <Route path="/inventory/properties" element={<Properties />} />
            <Route path="/inventory/developers" element={<Developers />} />
            <Route path="/inventory/brokers" element={<Brokers />} />
            <Route path="/inventory/requests" element={<GeneralRequests />} />
            <Route path="/inventory/real-estate-requests" element={<RealEstateRequests />} />
            <Route path="/inventory/real-estate-price-books" element={<RealEstatePriceBooks />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/inventory/buyer-requests" element={<BuyerRequests />} />
            <Route path="/inventory/seller-requests" element={<SellerRequests />} />

            <Route element={<ProtectedModuleRoute moduleKey="campaigns" />}> 
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/marketing/campaigns" element={<Campaigns />} />
              <Route path="/marketing/landing-pages" element={<LandingPages />} />
              <Route path="/marketing/landing-pages/add" element={<AddLandingPage />} />
              <Route path="/marketing/meta-integration" element={<MetaIntegration />} />
              <Route path="/marketing/reports" element={<MarketingReports />} />
              <Route path="/marketing/reports/campaign-summary" element={<CampaignSummaryReport />} />
              <Route path="/marketing/reports/lead-source-performance" element={<LeadSourcePerformanceReport />} />
              <Route path="/marketing/reports/cost-vs-revenue" element={<CostVsRevenueReport />} />
              <Route path="/marketing/reports/monthly-overview" element={<MonthlyMarketingOverview />} />
            </Route>

            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/reports/overview" element={<ReportsDashboard />} />
            <Route path="/reports/dashboard" element={<ReportsDashboard />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/sales/activities" element={<SalesActivitiesReport />} />
            <Route path="/reports/sales/pipeline" element={<LeadsPipelineReport />} />
            <Route path="/reports/sales/reservations" element={<ReservationsReport />} />
            <Route path="/reports/sales/closed-deals" element={<ClosedDealsReport />} />
            <Route path="/reports/sales/rent" element={<RentReport />} />
            <Route path="/reports/sales/check-in" element={<CheckInReport />} />
            <Route path="/reports/sales/customers" element={<CustomersReport />} />
            <Route path="/reports/sales/imports" element={<ImportsReport />} />
            <Route path="/reports/sales/exports" element={<ExportsReport />} />
            <Route path="/exports" element={<ExportsReport />} />
            <Route path="/reports/sales/meetings" element={<MeetingsReport />} />
            <Route path="/reports/leads" element={<LeadsReport />} />
            <Route path="/reports/team" element={<TeamPerformanceReport />} />
            <Route path="/reports/sms" element={<ReportPlaceholder titleKey="Sms Report" descKey="reports.sms.desc" />} />
            <Route path="/reports/calls" element={<ReportPlaceholder titleKey="Calls Report" descKey="reports.calls.desc" />} />
            <Route path="/reports/performance" element={<TeamPerformanceReport />} />
            <Route path="/team-performance" element={<TeamPerformanceReport />} />

            <Route element={<ProtectedModuleRoute moduleKey="settings" />}> 
              <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
              <Route path="/settings/profile" element={<ProfileSettings />} />
              <Route path="/settings/profile/company" element={<CompanySettings />} />
              <Route path="/settings/profile/contact-info" element={<ContactInfoSettings />} />
              <Route path="/settings/system/preferences" element={<SystemPreferences />} />
              <Route path="/settings/system/modules" element={<ModulesSettings />} />
              <Route path="/settings/system/security" element={<SecuritySettings />} />
              <Route path="/settings/system/custom-fields" element={<CustomFields />} />
              <Route path="/settings/system/audit-logs" element={<AuditLogs />} />
              <Route path="/settings/configuration" element={<SettingsConfiguration />} />
              <Route path="/settings/configuration/cancel-reasons" element={<CancelReasons />} />
              <Route path="/settings/configuration/payment-plans" element={<PaymentPlans />} />

              <Route path="/settings/company-setup" element={<Navigate to="/settings/company-setup/info" replace />} />
              <Route path="/settings/company-setup/info" element={<Suspense fallback={<div className="p-4 text-sm">Loading…</div>}><CompanyInfoPage /></Suspense>} />
              <Route path="/settings/company-setup/subscription" element={<Suspense fallback={<div className="p-4 text-sm">Loading…</div>}><SubscriptionPage /></Suspense>} />
              <Route path="/settings/company-setup/modules" element={<Suspense fallback={<div className="p-4 text-sm">Loading…</div>}><ModulesPage /></Suspense>} />
              <Route path="/settings/company-setup/departments" element={<Suspense fallback={<div className="p-4 text-sm">Loading…</div>}><DepartmentsPage /></Suspense>} />
              <Route path="/settings/company-setup/visibility" element={<Suspense fallback={<div className="p-4 text-sm">Loading…</div>}><VisibilityPage /></Suspense>} />

              <Route element={<BillingAdminRoute />}> <Route path="/settings/billing/subscription" element={<BillingSubscription />} /> </Route>
              <Route path="/settings/billing/payment-history" element={<PaymentHistory />} />
              <Route path="/settings/billing/plans-upgrade" element={<PlansUpgrade />} />
              <Route path="/settings/integrations/api-keys" element={<APIKeys />} />
              <Route path="/settings/integrations/webhooks" element={<Webhooks />} />
              <Route path="/settings/integrations/whatsapp" element={<WhatsAppIntegration />} />
              <Route path="/settings/integrations/payment-gateway" element={<PaymentGatewayIntegration />} />
              <Route path="/settings/integrations/google-slack" element={<GoogleSlackIntegrations />} />
              <Route path="/settings/data/import" element={<ImportDM />} />
              <Route path="/settings/data/export" element={<ExportDM />} />
              <Route path="/settings/data/backup" element={<Backup />} />
              <Route path="/settings/operations/scripting" element={<Scripting />} />
              <Route path="/settings/operations/eoi" element={<EOISettings />} />
              <Route path="/settings/operations/reservation" element={<ReservationSettings />} />
              <Route path="/settings/operations/rotation" element={<RotationSettings />} />
              <Route path="/settings/operations/contracts" element={<ContractsSettings />} />
              <Route path="/settings/operations/buyer-request-reset" element={<BuyerRequestReset />} />
              <Route path="/settings/operations/matching" element={<MatchingSettings />} />
              <Route path="/settings/operations/rent" element={<RentConfiguration />} />
              <Route path="/settings/operations/cil" element={<CILSettings />} />
            </Route>

            {/* User Management */}
            <Route path="/user-management/users" element={<UserManagementUsers />} />
            <Route path="/user-management/users/new" element={<UserManagementUserCreate />} />
            <Route path="/user-management/activity-logs" element={<UserManagementActivityLogs />} />
            <Route path="/user-management/access-logs" element={<UserManagementAccessLogs />} />
            <Route path="/user-management/roles" element={<UserManagementRoles />} />
            <Route path="/user-management/roles/:name" element={<UserManagementRoleEdit />} />


            <Route path="/contact" element={<ContactUs />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Public Landing Pages - Must be last to avoid conflicts */}
        <Route path="/:slug" element={<LandingPageViewer />} />
      </Routes>
    </div>
  )
}

const CompanyInfoPage = lazy(() => import('../pages/settings/company-setup/company-info/CompanyInfoPage'))
const SubscriptionPage = lazy(() => import('../pages/settings/company-setup/subscription/SubscriptionPage'))
const ModulesPage = lazy(() => import('../pages/settings/company-setup/modules/ModulesPage'))
const DepartmentsPage = lazy(() => import('../pages/settings/company-setup/departments/DepartmentsPage'))
const VisibilityPage = lazy(() => import('../pages/settings/company-setup/visibility/VisibilityPage'))
