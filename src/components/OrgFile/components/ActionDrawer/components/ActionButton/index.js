import React, { PureComponent } from 'react';

import './stylesheet.css';

import classNames from 'classnames';
import _ from 'lodash';

export default class ActionButton extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, ['handleClick']);
  }

  handleClick() {
    const { onClick, isDisabled } = this.props;

    if (isDisabled) {
      return;
    }

    onClick();
  }

  render() {
    const {
      iconName,
      subIconName,
      isDisabled,
      shouldRotateSubIcon,
      letter,
      additionalClassName,
      style,
      tooltip,
      shouldSpinSubIcon,
      onRef,
      subIconStyle,
      subIconSize
    } = this.props;

    const className = classNames(
      'btn',
      // 'btn--circle',
      'action-drawer__btn',
      additionalClassName || '',
      {
        fas: !letter,
        'fa-xl': !letter,
        [`fa-${iconName}`]: !letter,
        'action-drawer__btn--with-sub-icon': !!subIconName,
        'btn--disabled': isDisabled,
        'action-drawer__btn--letter': !!letter,
      }
    );

    const subIconClassName = classNames(
      'fas',
      `fa-${!!subIconSize ? subIconSize : "xs"}`,
      `fa-${subIconName}`,
      'action-drawer__btn__sub-icon',
      {
        'action-drawer__btn__sub-icon--rotated': shouldRotateSubIcon,
        'fa-spin': shouldSpinSubIcon,
      }
    );

    return (
      <button
        className={className}
        onClick={this.handleClick}
        style={{...style, padding: "8px", color: "var(--base03"}}
        title={tooltip}
        ref={onRef}
      >
        {!!letter && letter}
        {!!subIconName && <i className={subIconClassName} style={subIconStyle} />}
      </button>
    );
  }
}
