import React from 'react';

const AvailabilityList = ({ availabilities}) => {
  return (
    <div >
      <h6 className='h6 es-subtitle' style={{fontSize:"12px"}} >Liste des disponibilités :</h6>
      {availabilities.length > 0 ? (
        <ul>
          {availabilities.map((availability, index) => (
            <li key={index}>
              {`${availability.days.join(', ')} - ${availability.start} - ${availability.end}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune disponibilité définie.</p>
      )}
    </div>
  );
};

export default AvailabilityList;
