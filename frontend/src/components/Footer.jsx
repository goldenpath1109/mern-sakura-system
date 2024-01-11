import { Navbar, Nav, Container} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Footer = () => {

  return (
    <footer style={{position: 'fixed', bottom: 0, width: "100%", zIndex: 10}}>
      <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect>
        <Container>
            <Navbar.Toggle aria-controls='basic-navbar-nav' />
            <Navbar.Collapse id='basic-navbar-nav'>
                <Nav className='ms-auto'>
                    <LinkContainer to='/rule'>
                        <Nav.Link>
                        ソフトウェア利用規約（サブスクリプション）
                        </Nav.Link>
                    </LinkContainer>
                    <LinkContainer to='/raw'>
                        <Nav.Link>
                        特定商取引法に基づく表記
                        </Nav.Link>
                    </LinkContainer>
                </Nav>
            </Navbar.Collapse>
        </Container>
      </Navbar>
    </footer>
  );
};

export default Footer;
