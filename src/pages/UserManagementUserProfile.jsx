import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@shared/layouts/Layout';
import UserManagementUserCreate from '../features/Users/UserForm';

// Mock data to simulate fetching user details
const mockUser = {
  id: 'u-1001',
  fullName: 'Ibrahim Hassan',
  username: 'ibrahim.h',
  email: 'ibrahim@example.com',
  phone: '+20 100 000 0000',
  role: 'Admin',
  status: 'Active',
  team: 'Support',
  department: 'Customer Support',
  lastLogin: '2025-11-18 10:24',
  createdAt: '2025-10-02',
  permissions: {
    Tickets: ['view', 'create', 'update', 'delete', 'assign', 'close'],
    Customers: ['view', 'create', 'update', 'delete'],
    Reports: ['view', 'export'],
  },
};

export default function UserManagementUserProfile({ userProp, idProp, asModal = false, onClose }) {
  const { id: routeId } = useParams();
  const id = idProp || routeId;
  const navigate = useNavigate();
  
  const user = useMemo(() => {
    if (userProp) return userProp;
    return { ...mockUser, id };
  }, [userProp, id]);

  if (asModal) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[var(--content-bg)] text-[var(--content-text)] border border-base-300 shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 z-20 btn btn-circle btn-sm btn-ghost bg-base-100/50 hover:bg-base-100"
           >
             <X size={20} />
           </button>
           <UserManagementUserCreate 
             user={user} 
             onClose={onClose}
             onSuccess={() => {
                if (onClose) onClose();
             }}
           />
        </div>
      </div>
    );
  }

  return (
    <Layout title={`Edit User — ${user.fullName}`}>
      <div className="p-6 max-w-5xl mx-auto">
        <UserManagementUserCreate 
           user={user}
           onSuccess={() => navigate('/user-management/users')}
        />
      </div>
    </Layout>
  );
}
