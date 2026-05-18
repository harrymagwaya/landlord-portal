import UserDirectory from './UserDirectory';

export default function Tenants() {
  return <UserDirectory title="Tenants" subtitle="View tenant accounts registered in the platform." roleFilter="TENANT" />;
}
