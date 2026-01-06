import { Container, Box } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg">
        {children}
      </Container>
    </Box>
  );
};

export default Layout;