import UserDirectory from 'components/users/UserDirectory';

export default function LoanAdminsPage() {
  return <UserDirectory title="Loan Admins" subtitle="Directory of loan administrator accounts." roleFilter="LOAN_ADMIN" />;
}
