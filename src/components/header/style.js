import React from 'react';
import styled from 'styled-components';

const NavLink = styled.a`
  margin: 0 1rem;
  font-size: 1.2rem;
  font-weight: 400;
  color: #000;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Icon = styled.i`
  margin-right: .5rem;
  min-width: 24px;
`;

const NavIcon = p => {
  return <Icon className={`fas fa-${p.type}`}></Icon>;
};

export { NavLink, NavIcon };
