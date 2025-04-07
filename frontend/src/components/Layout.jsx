import { AppBar, Toolbar, Typography, Container } from '@mui/material';

export default function Layout({ children }) {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">BeautyChat</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>{children}</Container>
    </div>
  );
}