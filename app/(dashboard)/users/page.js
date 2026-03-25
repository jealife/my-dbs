import { UserDirectory } from "@/components/user-directory";

const users = [
  { name: 'Admin Root', code: 'ADM-001', email: 'admin@school.com', active: true },
  { name: 'Alice Secrétariat', code: 'STA-005', email: 'alice.s@school.com', active: true },
  { name: 'Thomas Support', code: 'STA-009', email: 'thomas.s@school.com', active: true },
];

export default function UsersPage() {
  return (
    <UserDirectory 
      title="Comptes Utilisateurs"
      description="Gestion centralisée des accès système pour tous les rôles administratifs de l'établissement."
      role="Administrateur"
      users={users}
    />
  );
}
