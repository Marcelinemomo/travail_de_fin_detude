import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api';
import ServerMessage from '../../components/serverMessage/ServerMessage';
import { Row, Col, Carousel, Form } from 'react-bootstrap';
import DetailedService from './DetailedService';
import { getToken, getUser } from '../../util';
import SmallServicesCard from '../../components/profil/SmallServicesCard';
import Window from '../../components/window/Window';
import BigServiceDetailCardForDashoard from '../../components/service/BigServiceDetailCardForDashoard';
import { FaCheck, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import WindowForUpdateService from '../../components/window/WindowForUpdateService';
import EditService from '../../components/service/EditService';
import Loading from '../../components/loading/Loading';

const AllServices = () => {
  const [services, setServices] = useState([]);
  const [serverMessage, setServerMessage] = useState(null);
  const [serverMessageKey, setServerMessageKey] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [reLoading, setReLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(false);
  const token = getToken();
  const userID = getUser()._id;
  const [providers, setProviders] = useState(null);
  const [selectedProviderId, setselectedProviderId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState({});

  const header = {
    headers: {
      Authorization: `Bearer ${token}`,
      id: userID
    },
  }
  const fetchServices = async () => {
    if (!localStorage.getItem('isconnected')) return Navigate('/signin');
    try {
      await api.getServices({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        setServices(res.data);
        setServerMessageKey((prevKey) => prevKey + 1);
      });
    } catch (error) {
      setServerMessageKey((prevKey) => prevKey + 1);
      const resolvedError = await error.response;
      setServerMessage({ message: resolvedError?.data?.message, type: 'error' });
      console.log("Une erreur c'est produit lors de la recupération des services ", error);
    }
  };

  const fetchProviders = async ()=>{
    try {
      await api.getUsers(header)
      .then(res => {
        setProviders(res.data);
      })
      setShowLoading(false);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchServices();
    fetchProviders();

  }, [token, reLoading]);

  const removeService = async (serviceId) => {
    setShowLoading(true);
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await api.deleteService({
          headers: {
            Authorization: `Bearer ${token}`,
            id: serviceId
          },
        }).then(res => {
          console.log(res)
          setServerMessage({ message: res.data.message, type: 'success' });
          setServerMessageKey(prev =>prev+1)
        })
        setReLoading((prev) => !prev); 

      } catch (error) {
        console.log(error)
        const resolvedError = await error.response;
        setServerMessage({ message: resolvedError?.data?.message, type: 'error' });
        console.log("Une erreur s'est produite lors de la suppression du service ", error);
      }finally{
        setShowLoading(false);
      }


    }
  };


  const handleClickPlus = (serviceId, userId) => {
    const updatedUsers = selectedUsers[serviceId] || [];
    if (updatedUsers.includes(userId)) {
      updatedUsers.splice(updatedUsers.indexOf(userId), 1); // Supprimer l'utilisateur sélectionné
    } else {
      updatedUsers.push(userId);
    }

    setSelectedUsers({
      ...selectedUsers,
      [serviceId]: updatedUsers,
    });
  };

  const handleSendData = async (serviceId, ProviderId) => {
    const selectedProviderId = selectedUsers[serviceId];
    console.log("serviceId  ", serviceId)
    console.log("selectedProviderId  ", ProviderId)
    if (!selectedProviderId) {
      return;
    }

    try {
      await api.copyServiceTo({
        serviceId: serviceId,
        newProvider: ProviderId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          id: userID,
        },
      });

      setServerMessage({ message: 'Service copié avec succès', type: 'success' });
      setServerMessageKey((prevKey) => prevKey + 1);
    } catch (error) {
      const resolvedError = await error.response;
      setServerMessage({ message: resolvedError?.data?.message, type: 'error' });
      console.log("Une erreur s'est produite lors de la copie du service ", error);
    }
  };

  return (
    <div className='service-dashboard'>
      {serverMessage && (
        <ServerMessage
          message={serverMessage.message}
          type={serverMessage.type}
          key={serverMessageKey}
        />
      )}
            <br />
      <br />
      <br />
      <br />
      {
        services.length !== 0 ?
        <Row className="mb-4" >
          {
            services.map((service, key) => (
              service != null && !service.isDeleted && <Col md={3} key={service.id} className=" mb-5 over-service">
              <div onClick={() => setSelectedService(service)}>
                <SmallServicesCard shadow={"shadow-style"} key={key} height={"200px"} width={"200px"} service={service} />
              </div>
              <div className='icon' onClick={()=> setSelectedService(service)}>
                {
                  (getUser().roles[0].name === "admin" || getUser()._id === service.providerId ||  getUser()._id === service.providerId._id) ?
                  <>
                      <WindowForUpdateService showEditIcon={true} > 
                        <EditService service={service} setReLoading={setReLoading} />
                      </WindowForUpdateService>
                      <span className='action-service' onClick={() => removeService(service._id)}>
                        <FaTrash /> 
                      </span>
                      <Window> <BigServiceDetailCardForDashoard service={service} width={"200px"} height={"200px"} /> </Window>
                      
                      <span className='action-service' key={key} onClick={() => handleClickPlus(service._id)}>
                      <FaPlus />
                    </span>
                    
                    <Form.Group controlId="categorie" className='mt-4'>
                      <div className="d-flex">
                        <Form.Control
                          as="select"
                          value={selectedProviderId}
                          className="es-inputs providers"
                          onChange={(e) => setselectedProviderId(e.target.value)}
                        >
                          <option>Copier à {selectedProviderId && selectedProviderId.futureProviderName}</option>
                          {providers && providers.map((provider) => {
                            if (provider.listservices != null && !provider.listservices.includes(service._id)) {
                              return (
                                <option key={provider._id} value={provider._id}>
                                  {provider.firstname + " " + provider.lastname}
                                </option>
                              );
                            }
                            return null;
                          })}
                        </Form.Control>
                        <span className='row justify-content-center align-items-center m-1 copy-data' style={{ cursor: 'pointer' }}>
                          <FaCheck size={25} onClick={() => handleSendData(service._id, selectedProviderId)} color='green' />
                        </span>
                      </div>
                    </Form.Group>

                    
                  
                </> : null}
              </div>
              
            </Col>
          ))}
        </Row> :
        <Loading />
      }
      <div>
        {
          showLoading &&
              <Loading />
        }
      </div>
    </div>
  );
};

export default AllServices;
