import React from 'react';

import Header from '../header';
import Footer from '../footer';
import Pastures from '../pastures';
import { Container } from './style';

const Layout = ({ children }) => (
  <Container>
    <Header />
    {children}
    <Footer />
    <Pastures />
  </Container>
);

export default Layout;
