import { styled } from "@mui/material/styles";

const Footer = styled('footer')(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(6),
}));

export default Footer;