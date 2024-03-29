import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {isLandingPage} from '../../util/misc';

import {Link, withRouter} from 'react-router-dom';

import logo from '../../images/organice.svg';

import './stylesheet.css';

import * as baseActions from '../../actions/base';
import * as orgActions from '../../actions/org';
import {ActionCreators as undoActions} from 'redux-undo';

import ExternalLink from '../UI/ExternalLink';

import {List} from 'immutable';
import _ from 'lodash';
import classNames from 'classnames';
import {format, formatRelative} from "date-fns";

class HeaderBar extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleChangelogClick',
      'handleModalPageDoneClick',
      'handleHeaderBarTitleClick',
      'handleBackClick',
      'handleUndoClick',
      'handleRedoClick',
      'handleSettingsClick',
    ]);
  }

  getPathRoot() {
    const {
      location: {pathname},
    } = this.props;
    return pathname.split('/')[1];
  }

  getFilename() {
    const {
      location: {pathname},
    } = this.props;
    // only show a filename if it's a file and not a path
    if (pathname.includes('.org')) {
      return pathname.substring(pathname.lastIndexOf('/') + 1, pathname.lastIndexOf('.'));
    } else {
      return '';
    }
  }

  renderFileBrowserBackButton() {
    let backPath = 'Back';
    const fileParts = window.location.href.split('/').map((e) => decodeURIComponent(e));
    if (_.includes(fileParts, 'files')) {
      backPath = _.last(fileParts);
    }

    return (
      <div
        onClick={() => {
          window.history.back();
        }}
        className="header-bar__back-button"
      >
        <i className="fas fa-chevron-left"/>
        <span className="header-bar__back-button__directory-path">{backPath}</span>
      </div>
    );
  }

  renderOrgFileBackButton() {
    const {
      location: {pathname},
    } = this.props;

    let filePath = pathname.substr('/file'.length);
    if (filePath.endsWith('/')) {
      filePath = filePath.substring(0, filePath.length - 1);
    }

    const pathParts = filePath.split('/');
    const directoryPath = pathParts.slice(0, pathParts.length - 1).join('/');

    return (
      <Link
        to={`/files${directoryPath}`}
        onClick={this.handleBackClick}
        className="header-bar__back-button"
      >
        {/*<i className="fas fa-chevron-left" />*/}
        <i className="fas fa-folder-tree fa-xl" style={{paddingRight: "10px"}}/>
        {/*<span className="header-bar__back-button__directory-path">File browser</span>*/}
      </Link>
    );
  }

  renderLogo() {
    return (
      <div className="header-bar__logo-container">
        <img className="header-bar__logo" src={logo} alt="Logo" width="30" height="30"/>
        <h2 className="header-bar__app-name">organice</h2>
      </div>
    );
  }

  renderHomeFileBackButton() {
    return (
      <Link to={`/`} className="header-bar__back-button">
        <i className="fas fa-chevron-left"/>
        <span className="header-bar__back-button__directory-path">Home</span>
      </Link>
    );
  }

  renderSignInBackButton() {
    return (
      <Link to={`/`} className="header-bar__back-button">
        <i className="fas fa-chevron-left"/>
        <span className="header-bar__back-button__directory-path">Home</span>
      </Link>
    );
  }

  handleBackClick() {
    this.props.base.popModalPage();
  }

  renderSettingsSubPageBackButton() {
    return (
      <div className="header-bar__back-button" onClick={this.handleBackClick}>
        <i className="fas fa-chevron-left"/>
        <span className="header-bar__back-button__directory-path">Settings</span>
      </div>
    );
  }

  renderBackButton() {
    const {activeModalPage} = this.props;

    switch (activeModalPage) {
      case 'changelog':
        return this.renderSettingsSubPageBackButton();
      case 'keyboard_shortcuts_editor':
        return this.renderSettingsSubPageBackButton();
      case 'capture_templates_editor':
        return this.renderSettingsSubPageBackButton();
      case 'file_settings_editor':
        return this.renderSettingsSubPageBackButton();
      case 'sample':
        return this.renderOrgFileBackButton();
      default:
    }

    switch (this.getPathRoot()) {
      case '':
        return this.renderLogo();
      case 'files':
        return this.renderFileBrowserBackButton();
      case 'file':
        return this.renderOrgFileBackButton();
      case 'sample':
        return this.renderHomeFileBackButton();
      case 'sign_in':
        return this.renderSignInBackButton();
      case 'settings':
        return this.renderFileBrowserBackButton();
      case 'changelog':
        return this.renderFileBrowserBackButton();
      default:
        return <div/>;
    }
  }

  renderTitle() {
    const titleContainerWithText = (text) => (
      <div className="header-bar__title" style={{alignSelf: 'center'}} onClick={this.handleHeaderBarTitleClick}>
        {text}
      </div>
    );

    switch (this.props.activeModalPage) {
      case 'changelog':
        return titleContainerWithText('Changelog');
      case 'settings':
        return titleContainerWithText('Settings');
      case 'keyboard_shortcuts_editor':
        return titleContainerWithText('Shortcuts');
      case 'capture_templates_editor':
        return titleContainerWithText('Capture');
      case 'file_settings_editor':
        return titleContainerWithText('Files');
      case 'sample':
        return titleContainerWithText('Sample');
      default:
    }

    switch (this.getPathRoot()) {
      case 'sample':
        return titleContainerWithText('Sample');
      case 'sign_in':
        return titleContainerWithText('Sign in');
      case 'settings':
        return titleContainerWithText('Settings');
      default:
    }

    return titleContainerWithText(this.props.shouldShowTitleInOrgFile ? this.getFilename() : '');
  }

  handleChangelogClick() {
    this.props.base.restoreStaticFile('changelog');
    this.props.base.pushModalPage('changelog');
  }

  handleModalPageDoneClick() {
    this.props.base.clearModalStack();
  }

  handleHeaderBarTitleClick() {
    this.props.org.selectHeader(null);
  }

  handleUndoClick() {
    if (this.props.isUndoEnabled) {
      this.props.undo.undo();
    }
  }

  handleRedoClick() {
    if (this.props.isRedoEnabled) {
      this.props.undo.redo();
    }
  }

  handleSettingsClick() {
    this.props.base.setLastViewedFile(this.props.path);
  }

  renderActions() {
    const {
      isAuthenticated,
      hasUnseenChangelog,
      activeModalPage,
      path,
      isUndoEnabled,
      isRedoEnabled,
    } = this.props;

    if (!!activeModalPage) {
      return (
        <div className="header-bar__actions" onClick={this.handleModalPageDoneClick}>
          Done
        </div>
      );
    } else if (this.getPathRoot() !== 'settings') {
      const undoIconClassName = classNames('fas fa-xl fa-undo header-bar__actions__item', {
        'header-bar__actions__item--disabled': !isUndoEnabled,
      });
      const redoIconClassName = classNames('fas fa-xl fa-redo header-bar__actions__item', {
        'header-bar__actions__item--disabled': !isRedoEnabled,
      });

      const settingsIconClassName = classNames('fas fa-cogs fa-xl header-bar__actions__item');

      return (
        <Fragment>
          <div className="" style={{display: "flex"}}>
            {!isAuthenticated && this.getPathRoot() !== 'sign_in' && (
              <Link to="/sign_in">
                <div className="header-bar__actions__item" title="Sign in">
                  Sign in
                </div>
              </Link>
            )}

            {!isAuthenticated && (
              <ExternalLink href="https://github.com/200ok-ch/organice">
                <i className="fab fa-github header-bar__actions__item"/>
              </ExternalLink>
            )}

            {isAuthenticated && !activeModalPage && !!path && (
              <Fragment>
                <i className={undoIconClassName} onClick={this.handleUndoClick} title="Undo" style={{alignSelf: "center"}}/>
                <i className={redoIconClassName} onClick={this.handleRedoClick} title="Redo" style={{alignSelf: "center", paddingLeft: "5px"}}/>
              </Fragment>
            )}
          </div>
          <div className="">
            {isAuthenticated && (
              <div>
                {hasUnseenChangelog && (
                  <Link to="/changelog">
                    <i
                      className="changelog-icon--has-unseen-changelog header-bar__actions__item fas fa-gift"
                      title="Changelog"
                    />
                  </Link>
                )}
                <Link to="/settings" onClick={this.handleSettingsClick}>
                  <i className={settingsIconClassName} title="Settings" style={{paddingLeft: "5px"}}/>
                </Link>
              </div>
            )}
          </div>
        </Fragment>
      );
    }
  }

  render() {
    const className = classNames('header-bar', {
      'header-bar--with-logo': this.getPathRoot() === '',
    });

    // The LP does not show the HeaderBar
    if (!isLandingPage()) {
      return (
        <div className={className}>
          {this.renderBackButton()}
          <div style={{display: 'flex', flexDirection: 'column'}}>
          {this.renderTitle()}
          {this.renderChangeTime()}
          </div>
          {this.renderActions()}
        </div>
      );
    }
    return null;
  }

  renderChangeTime() {
    let lastUpdated = ""
    if (this.props.files) {
      let current = this.props.files.get(this.props.path)
      if (current && current.get('lastSyncAt')) {
        lastUpdated = formatRelative(current.get('lastSyncAt'), new Date())
        console.log(`new Last Updated: ${lastUpdated}`)
      }
    }
    return (
      <div style={{alignSelf: 'center', fontSize: '10px'}} className={'header-bar__title'}>{lastUpdated ? (lastUpdated) : ''}</div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.syncBackend.get('isAuthenticated'),
    hasUnseenChangelog: state.base.get('hasUnseenChangelog'),
    activeModalPage: state.base.get('modalPageStack', List()).last(),
    shouldShowTitleInOrgFile: state.base.get('shouldShowTitleInOrgFile'),
    path: state.org.present.get('path'),
    files: state.org.present.get('files'),
    isUndoEnabled: state.org.past.length > 0,
    isRedoEnabled: state.org.future.length > 0,
    syncBackendType: state.syncBackend.get('client') && state.syncBackend.get('client').type,

  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    base: bindActionCreators(baseActions, dispatch),
    org: bindActionCreators(orgActions, dispatch),
    undo: bindActionCreators(undoActions, dispatch),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderBar));
