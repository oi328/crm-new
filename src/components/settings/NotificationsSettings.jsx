import React, { useState } from 'react'

const NotificationsSettings = () => {
  const [channels, setChannels] = useState({ email: true, inapp: true, sms: false })
  const [events, setEvents] = useState({ newClient: true, invoiceCreated: true, paymentReceived: true, taskAssigned: false })
  const setChannel = (k, v) => setChannels(prev => ({ ...prev, [k]: v }))
  const setEvent = (k, v) => setEvents(prev => ({ ...prev, [k]: v }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Channels</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={channels.email} onChange={e=>setChannel('email', e.target.checked)} />
            <span>Email Alerts</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={channels.inapp} onChange={e=>setChannel('inapp', e.target.checked)} />
            <span>In-App Alerts</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={channels.sms} onChange={e=>setChannel('sms', e.target.checked)} />
            <span>SMS Alerts</span>
          </label>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Events</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={events.newClient} onChange={e=>setEvent('newClient', e.target.checked)} />
            <span>New Client Added</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={events.invoiceCreated} onChange={e=>setEvent('invoiceCreated', e.target.checked)} />
            <span>Invoice Created</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={events.paymentReceived} onChange={e=>setEvent('paymentReceived', e.target.checked)} />
            <span>Payment Received</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={events.taskAssigned} onChange={e=>setEvent('taskAssigned', e.target.checked)} />
            <span>Task Assigned</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSettings