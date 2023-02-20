import React from 'react';

import './stylesheet.css';

export default ({ buttons, titles, values, selectedButton, useEqualWidthTabs, onSelect }) => {
  const handleButtonClick = (buttonName) => () => onSelect(buttonName);

  return (
    <div style={{display: "flex", margin: "15px 0px", justifyContent: "flex-start", gap: "15px", flexWrap: "wrap"}}>
      {buttons.map((buttonName, index) => {
        const value = values ? values[index] : buttonName;
        // Optionally add a title
        let title = '';
        if (titles) {
          title = titles[index];
        }

        return (
          <div
            key={buttonName + index}
            title={title}
            onClick={handleButtonClick(value)}
            style={{
              border: "1px solid",
              padding: "5px",
              borderRadius: ".25rem",
              alignSelf: "center",
              fontSize: "10px",
              color: selectedButton === buttonName ? "var(--orange)" : ""
            }}
          >
            {buttonName}
          </div>
        );
      })}
    </div>
  );
};
