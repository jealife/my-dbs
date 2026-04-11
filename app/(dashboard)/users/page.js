'use client'

import { useState } from 'react'
import { UserDirectory } from "@/components/user-directory";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/user-service';
import { AddUserModal } from '@/modules/users/components/add-user-modal';
import { EditUserModal } from '@/modules/users/components/edit-user-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MaintenanceZone } from '@/components/ui/maintenance-zone';


export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', 'all', filterRole],
    queryFn: () => userService.getUsersByRole(filterRole === 'ALL' ? '' : filterRole)
  });

  if (error) return (
    <div className="p-8">
      <MaintenanceZone 
        error={error} 
        reset={refetch} 
        zone="Gestion Utilisateurs"
      />
    </div>
  );

  const handleDelete = (id, name) => {
    setUserToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id, 'ADMIN');
      toast.success(`${userToDelete.name} supprimé avec succès`);
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      if (err.response?.status === 404) {
        toast.success("Déjà supprimé de la base.");
        setIsDeleteModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="w-full">
      <UserDirectory 
        title="Gestion Utilisateurs"
        description="Administration centralisée de tous les comptes du système (Admins, Direction, Mentors, etc.)"
        role="Super Admin"
        users={users || []}
        isLoading={isLoading}
        activeRole={filterRole}
        onRoleChange={setFilterRole}
        onDelete={handleDelete}
        onAdd={() => setIsModalOpen(true)}
        onEdit={handleEdit}
      />

      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
        initialRole="ADMIN"
      />

      <EditUserModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onUpdateSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />

      <AnimatePresence>
        {isDeleteModalOpen && (
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Supprimer l'utilisateur"
            message={`Êtes-vous sûr de vouloir supprimer ${userToDelete?.name} ? Cette action est irréversible.`}
            confirmText="Supprimer"
            loading={isDeleting}
            variant="danger"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
