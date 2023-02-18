import React from 'react';

import './stylesheet.css';

export default ({state, onClick}) => {
  return (
    <div className="checkbox" onClick={onClick}>
      <div className="checkbox__inner-container">
        {state === 'checked' && <i className="fas fa-check"/>}
        {state === 'partial' && <i className="fas fa-minus"/>}
      </div>
    </div>
  );
};
