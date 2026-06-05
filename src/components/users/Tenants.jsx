import { useMemo } from 'react';

import UserDirectory from './UserDirectory';

import useAuth from 'hooks/useAuth';
import { usePropertiesByLandlord } from 'hooks/useProperty';
import { useRentalProfiles } from 'hooks/useRentalProfle';
import { USER_ROLES } from 'utils/roles';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function Tenants() {
  const { role, userId } = useAuth();
  const isLandlord = role === USER_ROLES.LANDLORD;

  const { data: propertiesData } = usePropertiesByLandlord(isLandlord ? userId : null);
  const { data: rentalProfilesData } = useRentalProfiles();

  const allowedTenantIds = useMemo(() => {
    if (!isLandlord) return null;

    const properties = extractList(propertiesData);
    const propertyIds = new Set(properties.map((property) => property.id || property.propertyId).filter(Boolean));

    return new Set(
      extractList(rentalProfilesData)
        .filter((profile) => {
          const propertyId = profile.propertyId || profile.property?.id || profile.property?.propertyId;
          const landlordId = profile.landlordId || profile.landlord?.id || profile.landlord?.userId;

          return landlordId === userId || (propertyId && propertyIds.has(propertyId));
        })
        .map((profile) => profile.tenantId || profile.tenant?.id || profile.tenant?.userId)
        .filter(Boolean)
    );
  }, [isLandlord, propertiesData, rentalProfilesData, userId]);

  return (
    <UserDirectory
      title={isLandlord ? 'My Tenants' : 'Tenants'}
      subtitle={
        isLandlord
          ? 'View tenants who are attached to your properties through rental profiles.'
          : 'View tenant accounts registered in the platform.'
      }
      roleFilter="TENANT"
      userFilter={isLandlord ? (user) => allowedTenantIds?.has(user.id || user.userId) : undefined}
      emptyText={isLandlord ? 'No tenants are assigned to your properties yet.' : 'No tenants found.'}
    />
  );
}
