import UserProfileClient from "@/components/dashboard/user/UserProfileClient";

export default async function UsersPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <UserProfileClient />

        
      </div>

    </div>
  );
}