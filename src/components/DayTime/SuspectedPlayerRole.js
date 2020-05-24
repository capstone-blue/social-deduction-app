import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Badge from 'react-bootstrap/Badge';

const SuspectedPlayerRoleContainer = styled.div`
  position: absolute;
  width: 20rem;
  left: 50%;
  margin-left: -10rem;
  bottom: 136px;
  text-align: center;
`;

const SuspectBadge = styled(Badge)`
  font-size: 1.25rem;
  font-weight: 100;
`;

function SuspectedPlayerRole({ suspects, userId }) {
  const [suspectedRole, setSuspectedRole] = useState('Unknown Identity');
  useEffect(() => {
    if (suspects.val() && suspects.val()[userId])
      setSuspectedRole(`Suspected ${suspects.val()[userId]}`);
    else setSuspectedRole('Unknown Identity');
  }, [suspects, userId, setSuspectedRole]);

  return (
    <SuspectedPlayerRoleContainer>
      <SuspectBadge variant="danger">{suspectedRole}</SuspectBadge>
    </SuspectedPlayerRoleContainer>
  );
}

export default SuspectedPlayerRole;
