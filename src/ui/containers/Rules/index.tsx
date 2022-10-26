import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';

export const Rules = () => {
  const navigate = useNavigate();
  return (
    <div>
      <p>Rules</p>
      <button type="button" onClick={() => navigate(routesPath.SELECT_ACTION)}>
        Next
      </button>
    </div>
  );
};
