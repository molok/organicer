import React, { PureComponent } from 'react';

import './stylesheet.css';

export default class HeaderActionDrawer extends PureComponent {
  // A nasty hack required to get click handling to work properly in Firefox. No idea why its
  // broken in the first place or why this fixes it.
  iconWithFFClickCatcher({ className, onClick, title, testId = '' }) {
    return (
      <div
        title={title}
        onClick={onClick}
        className="header-action-drawer__ff-click-catcher-container"
      >
        <div className="header-action-drawer__ff-click-catcher" />
        <i className={className} data-testid={testId} />
      </div>
    );
  }

  render() {
    const {
      onTitleClick,
      onDescriptionClick,
      isNarrowed,
      onNarrow,
      onWiden,
      onAddNewHeader,
      onAddNestedHeader,
    } = this.props;

    return (
      <div className="header-action-drawer-container">
        <div className="header-action-drawer__row">
          {this.iconWithFFClickCatcher({
            className: 'fas fa-heading fa-lg',
            onClick: onTitleClick,
            title: 'Edit header title',
          })}

          {this.iconWithFFClickCatcher({
            className: 'fas fa-align-left fa-lg',
            onClick: onDescriptionClick,
            title: 'Edit header description',
            testId: 'edit-header-title',
          })}

          {this.iconWithFFClickCatcher({
            className: 'fas fa-plus fa-lg',
            onClick: onAddNewHeader,
            testId: 'header-action-plus',
            title: 'Create new header below',
          })}

          {this.iconWithFFClickCatcher({
            className: 'fas fa-arrow-circle-right fa-lg',
            onClick: onAddNestedHeader,
            testId: 'header-action-plusnested',
            title: 'Create a nested header',
          })}

          {isNarrowed
            ? this.iconWithFFClickCatcher({
                className: 'fas fa-expand fa-lg',
                onClick: onWiden,
                title: 'Widen (Cancelling the narrowing.)',
              })
            : this.iconWithFFClickCatcher({
                className: 'fas fa-compress fa-lg',
                onClick: onNarrow,
                testId: 'header-action-narrow',
                title:
                  'Narrow to subtree (focusing in on some portion of the buffer, making the rest temporarily inaccessible.)',
              })}
        </div>
      </div>
    );
  }
}
