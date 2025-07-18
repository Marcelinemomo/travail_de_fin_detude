import React from 'react';
import { Navbar, Container, Nav, Form, FormControl, Button, Dropdown, Image, Row} from 'react-bootstrap';
import './CustomNavbar.scss'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/actions';
import Loading from '../loading/Loading';
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../../util';
import { useEffect } from 'react';
import { useState } from 'react';
import { FaUser, FaUserAlt, FaUserAltSlash } from 'react-icons/fa';
import Notification from '../Notification/Notification';
import api from '../../api';
  


const CustomNavbar = ({addstyle}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const isconnected =  localStorage.getItem("isconnected");
  const  user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const [clickedMemberId, setClickedMemberId] = useState(null);


  const handleLogout = () => {
    localStorage.clear()
    return navigate("/signin");
  };
  const token = localStorage.getItem("token");
  const [services, setServices] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);

  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // Filter category

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.services({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const servicesData = res.data;
        setServices(servicesData);
        console.log(res);
  
      }catch (err) {
        console.log("Une erreur c'est produit lors de la recupération des services ", err);
      }
      };
      fetchServices()

  }, []);

  const isScrolled = scrollPosition > 0;


  if (!isconnected) {
    return <>
      <Row className='justify-content-center'>
        <h3>Reconnecte vous pour que les mises à jour soient appliquees</h3>
      </Row>
      <Loading />

    </>;
  }
  const navbarStyle = addstyle != null ? addstyle : (isScrolled ? 'scrolled' : '');
  const handleSearchChange = (event, newValue) => {
    if(newValue !== null){
      setSearchValue(newValue.label);
    }
    else{
      setSearchOptions("");
    }
  
  };  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setSearchValue(''); // Reset search value when category changes
  };

  return (
    <Navbar className={`navbar ${navbarStyle}`} expand="lg">
    <Container>
      <Navbar.Brand href="/home" className="text-color logo">
        EMMS PRESTATION
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/signup-artisan" className="text-color">
            Devenir prestataire
          </Nav.Link>

          <Nav.Link href="#notifications" className="position-relative">
            <i className="bi bi-bell"></i>
            {
              <span className="">
                <Notification clickedMemberId={clickedMemberId} />
              </span>
            }
          </Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link>
            <input
              className='search-input'
              type="text"
              placeholder="Rechercher par nom"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="search-results">
              <ul>
                {services
                  .filter((service) => {
                    if (
                      selectedCategory !== "all" &&
                      service.category !== selectedCategory
                    ) {
                      return false;
                    }

                    if (service.isDeleted) {
                      return false;
                    }

                    // Filter by name only
                    if (
                      service.name.toLowerCase().includes(searchValue.toLowerCase())
                    ) {
                      return true;
                    }

                    return false;
                  })
                  .map((service) => (
                    <li key={service.id}>
                      {/* Link to the service details page */}
                      <Link to={`/services/${service._id}`}>
                        {service.name} - {service.country}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

          </Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link className=" current-user position-relative">
            <span>
              <FaUser /> {getUser().firstname} &nbsp;
            </span>
            <span> {getUser().lastname} &nbsp;</span>
            <span className="role-user">
              {getUser().roles[0].name}
            </span>
          </Nav.Link>
        </Nav>
        <Dropdown align="end">
          <Dropdown.Toggle variant="none">
            {
              <Image
                src={`http://localhost:5000/${getUser().img}`}
                roundedCircle
                alt="Menu"
                width="50"
                height="50"
              />
            }
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
            <Dropdown.Item href="/dashboard">Dashboard</Dropdown.Item>
            <Dropdown.Item href="/service">Creer un service</Dropdown.Item>
            <Dropdown.Item href="/inbox">Inbox</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Déconnexion</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  );
};

export default CustomNavbar;
