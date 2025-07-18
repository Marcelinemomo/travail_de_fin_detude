import React, { useState } from 'react';
import api from '../../api';
import { getToken, getUser } from '../../util';
import useCheckUserDetails from '../VerifyAuth/useCheckUserDetails';
import ServerMessage from '../serverMessage/ServerMessage';

const AvailabilityForm = ({serviceID}) => {
  const [availability, setAvailability] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [serverMessageKey, setServerMessageKey] = useState(0);
  const [serverMessage, setServerMessage] = useState(null);
  const { shouldNavigate, serverMessage: serverMessageCheckUser } = useCheckUserDetails();
  // const [serviceid, setserviceid] = useState(serviceID);

  const handleChangeStartTime = (event) => {
    setStartTime(event.target.value);
  };

  const handleChangeEndTime = (event) => {
    setEndTime(event.target.value);
  };

  const handleAddAvailability = () => {
    if (selectedDays.length === 0) {
      return;
    }
    setAvailability([...availability, { start: startTime, end: endTime, days: selectedDays}]);
    setStartTime('');
    setEndTime('');
    setSelectedDays([]);
  };

  const handleRemoveAvailability = (index) => {
    const updatedAvailability = availability.filter((_, i) => i !== index);
    setAvailability(updatedAvailability);
  };

  const handleSubmit = async(e) => {
    console.log(availability);


    if (serviceID) {
      await api.updateAvailability({
        availability: availability,
      }, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          id: serviceID
        }
      })
      .then(response => {
        setServerMessageKey(prevKey =>prevKey + 1);
        setServerMessage({
          message: response.data.message,
          type: 'success',
        })
      })
      .catch(async error => {
        const resolvedError = await error.response;
        setServerMessage({ message: resolvedError?.data?.message, type: 'error' });
        setServerMessageKey(prevKey =>prevKey + 1);
      })
    }
  };
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const handleDaySelect = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  return (
    <div>
      {serverMessage && (
          <ServerMessage
            message={serverMessage.message}
            type={serverMessage.type}
            key={serverMessageKey}
          />
        )}
      <div>
        <label className='es-inputs'>
          Heure de début de la plage horaire :
          <input
            type="time"
            value={startTime}
            onChange={handleChangeStartTime}
            required
          />
        </label>
        <label className='es-inputs'>
          Heure de fin de la plage horaire :
          <input
            type="time"
            value={endTime}
            onChange={handleChangeEndTime}
            required
          />
        </label>
        <button type="button" className='es-button' onClick={handleAddAvailability}>Ajouter</button>
      </div>
      <div>
        <h2 className='es-subtitle text-black'>Sélectionnez les jours :</h2>
        {daysOfWeek.map((day) => (
          <button
            key={day}
            type="button"
            className={selectedDays.includes(day) ? 'btn bg-success ' : 'bg-gray'}
            onClick={() => handleDaySelect(day)}
          >
            {day}
          </button>
        ))}
      </div>
      <div>
        <h2 className='es-subtitle text-black'>Disponibilité définie :</h2>
        {availability.map((slot, index) => (
          <div key={index}>
            {`${slot.days.join(', ')} - ${slot.start} - ${slot.end}`}
            <button type="button" className="es-button es-button-delete " onClick={() => handleRemoveAvailability(index)}>Supprimer</button>
          </div>
        ))}
        {availability.length > 0 && (
          <button type="button" className="es-button mb-3"  onClick={handleSubmit}>Enregistrer la disponibilité</button>
        )}
      </div>
    </div>
  );
};

export default AvailabilityForm;
