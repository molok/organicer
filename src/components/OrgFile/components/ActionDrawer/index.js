import React, {Fragment, useMemo, useRef, useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Motion, spring} from 'react-motion';

import './stylesheet.css';

import {List, Map} from 'immutable';

import * as orgActions from '../../../../actions/org';
import * as captureActions from '../../../../actions/capture';
import * as baseActions from '../../../../actions/base';

import sampleCaptureTemplates from '../../../../lib/sample_capture_templates';

import ActionButton from './components/ActionButton/';
import {determineIncludedFiles} from '../../../../reducers/org';
import {moveHeaderDown, moveHeaderUp, moveSubtreeLeft, moveSubtreeRight} from "../../../../actions/org";

const ActionDrawer = ({
  org,
  selectedHeaderId,
  base,
  staticFile,
  captureTemplates,
  path,
  selectedTableCellId,
  isLoading,
  online,
  shouldDisableSyncButtons,
  activeClocks,
  editing,
  isNarrowedHeaderActive
}) => {
  const [isDisplayingArrowButtons, setIsDisplayingArrowButtons] = useState(false);
  const [isDisplayingCaptureButtons, setIsDisplayingCaptureButtons] = useState(false);

  const mainArrowButton = useRef(null);

  const mainArrowButtonBoundingRect = useMemo(
    () => (!!mainArrowButton.current ? mainArrowButton.current.getBoundingClientRect() : null),
    [mainArrowButton]
  );

  const handleUpClick = () =>
    !!selectedHeaderId ? org.moveHeaderUp(selectedHeaderId) : org.moveTableRowUp();

  const handleDownClick = () =>
    !!selectedHeaderId ? org.moveHeaderDown(selectedHeaderId) : org.moveTableRowDown();

  const handleLeftClick = () =>
    !!selectedHeaderId ? org.moveHeaderLeft(selectedHeaderId) : org.moveTableColumnLeft();

  const handleRightClick = () =>
    !!selectedHeaderId ? org.moveHeaderRight(selectedHeaderId) : org.moveTableColumnRight();

  const handleMoveSubtreeLeftClick = () => org.moveSubtreeLeft(selectedHeaderId);

  const handleMoveSubtreeRightClick = () => org.moveSubtreeRight(selectedHeaderId);

  const handleCaptureButtonClick = (templateId) => () => {
    setIsDisplayingCaptureButtons(false);
    base.activatePopup('capture', { templateId });
  };

  const getSampleCaptureTemplates = () => sampleCaptureTemplates;

  const getAvailableCaptureTemplates = () =>
    staticFile === 'sample'
      ? getSampleCaptureTemplates()
      : captureTemplates.filter(
          (template) =>
            template.get('isAvailableInAllOrgFiles') ||
            template
              .get('orgFilesWhereAvailable')
              .map((availablePath) =>
                availablePath.trim().startsWith('/')
                  ? availablePath.trim()
                  : '/' + availablePath.trim()
              )
              .includes((path || '').trim())
        );

  const handleSync = () => org.sync({ forceAction: 'manual' });

  const handleMainArrowButtonClick = () => setIsDisplayingArrowButtons(!isDisplayingArrowButtons);

  const handleSearchButtonClick = () => {
    base.activatePopup('search');
  };

  const handleMainCaptureButtonClick = () => {
    if (!isDisplayingCaptureButtons && getAvailableCaptureTemplates().size === 0) {
      alert(
        `You don't have any capture templates set up for this file! Add some in Settings > Capture Templates`
      );
      return;
    }

    setIsDisplayingCaptureButtons(!isDisplayingCaptureButtons);
  };

  const renderCaptureButtons = () => {
    const availableCaptureTemplates = getAvailableCaptureTemplates();

    const baseCaptureButtonStyle = {
      position: 'absolute',
      zIndex: 0,
      left: 0,
      opacity: isDisplayingArrowButtons ? 0 : 1,
    };
    if (!isDisplayingCaptureButtons) {
      baseCaptureButtonStyle.boxShadow = 'none';
    }

    const mainButtonStyle = {
      opacity: isDisplayingArrowButtons ? 0 : 1,
      position: 'relative',
      zIndex: 1,
    };

    const animatedStyle = {
      bottom: spring(isDisplayingCaptureButtons ? 70 : 0, { stiffness: 300 }),
    };

    return (
      <Motion style={animatedStyle}>
        {(style) => (
          <div className="action-drawer__capture-buttons-container">
            <ActionButton
              iconName={isDisplayingCaptureButtons ? 'times' : 'plus'}
              isDisabled={false}
              onClick={handleMainCaptureButtonClick}
              style={mainButtonStyle}
              tooltip={
                isDisplayingCaptureButtons ? 'Hide capture templates' : 'Show capture templates'
              }
            />

            {availableCaptureTemplates.map((template, index) => (
              <ActionButton
                key={template.get('id')}
                letter={template.get('letter')}
                iconName={template.get('iconName')}
                isDisabled={false}
                onClick={handleCaptureButtonClick(template.get('id'))}
                style={{ ...baseCaptureButtonStyle, bottom: style.bottom * (index + 1) }}
                tooltip={`Activate "${template.get('description')}" capture template`}
              />
            ))}
          </div>
        )}
      </Motion>
    );
  };

  const renderMovementButtons = () => {
    const baseArrowButtonStyle = {
      opacity: isDisplayingCaptureButtons ? 0 : 1,
    };
    if (!isDisplayingArrowButtons) {
      baseArrowButtonStyle.boxShadow = 'none';
    }

    let centerXOffset = 0;
    if (!!mainArrowButtonBoundingRect) {
      centerXOffset =
        window.screen.width / 2 -
        (mainArrowButtonBoundingRect.x + mainArrowButtonBoundingRect.width / 2);
    }

    const animatedStyles = {
      centerXOffset: spring(isDisplayingArrowButtons ? centerXOffset : 0, { stiffness: 300 }),
      topRowYOffset: spring(isDisplayingArrowButtons ? 150 : 0, { stiffness: 300 }),
      bottomRowYOffset: spring(isDisplayingArrowButtons ? 80 : 0, { stiffness: 300 }),
      firstColumnXOffset: spring(isDisplayingArrowButtons ? 70 : 0, {
        stiffness: 300,
      }),
      secondColumnXOffset: spring(isDisplayingArrowButtons ? 140 : 0, {
        stiffness: 300,
      }),
    };

    return (
      <Motion style={animatedStyles}>
        {(style) => (
          <div
            className="action-drawer__arrow-buttons-container"
            style={{ left: style.centerXOffset }}
          >
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-up"
              subIconName={!!selectedTableCellId ? 'table' : null}
              isDisabled={false}
              onClick={handleUpClick}
              style={{ ...baseArrowButtonStyle, bottom: style.topRowYOffset }}
              tooltip={!!selectedTableCellId ? 'Move row up' : 'Move header up'}
            />
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-down"
              subIconName={!!selectedTableCellId ? 'table' : null}
              isDisabled={false}
              onClick={handleDownClick}
              style={{ ...baseArrowButtonStyle, bottom: style.bottomRowYOffset }}
              tooltip={!!selectedTableCellId ? 'Move row down' : 'Move header down'}
            />
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-left"
              subIconName={!!selectedTableCellId ? 'table' : null}
              isDisabled={false}
              onClick={handleLeftClick}
              style={{
                ...baseArrowButtonStyle,
                bottom: style.bottomRowYOffset,
                right: style.firstColumnXOffset,
              }}
              tooltip={!!selectedTableCellId ? 'Move column left' : 'Move header left'}
            />
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-right"
              subIconName={!!selectedTableCellId ? 'table' : null}
              isDisabled={false}
              onClick={handleRightClick}
              style={{
                ...baseArrowButtonStyle,
                bottom: style.bottomRowYOffset,
                left: style.firstColumnXOffset,
              }}
              tooltip={!!selectedTableCellId ? 'Move column right' : 'Move header right'}
            />
            {!selectedTableCellId && (
              <Fragment>
                <ActionButton
                  additionalClassName="action-drawer__arrow-button"
                  iconName="chevron-left"
                  isDisabled={false}
                  onClick={handleMoveSubtreeLeftClick}
                  style={{
                    ...baseArrowButtonStyle,
                    bottom: style.bottomRowYOffset,
                    right: style.secondColumnXOffset,
                  }}
                  tooltip="Move entire subtree left"
                />
                <ActionButton
                  additionalClassName="action-drawer__arrow-button"
                  iconName="chevron-right"
                  isDisabled={false}
                  onClick={handleMoveSubtreeRightClick}
                  style={{
                    ...baseArrowButtonStyle,
                    bottom: style.bottomRowYOffset,
                    left: style.secondColumnXOffset,
                  }}
                  tooltip="Move entire subtree right"
                />
              </Fragment>
            )}

            <ActionButton
              iconName={isDisplayingArrowButtons ? 'times' : 'arrows-alt'}
              subIconName={!!selectedTableCellId ? 'table' : null}
              additionalClassName="action-drawer__main-arrow-button"
              isDisabled={false}
              onClick={handleMainArrowButtonClick}
              style={{ opacity: isDisplayingCaptureButtons ? 0 : 1 }}
              tooltip={isDisplayingArrowButtons ? 'Hide movement buttons' : 'Show movement buttons'}
              onRef={mainArrowButton}
            />
          </div>
        )}
      </Motion>
    );
  };

  // const handleAgendaClick = () => base.activatePopup('agenda');
  const handleShowTitleModal = () => {
    base.activatePopup('title-editor');
  }

  const handleShowDescriptionModal = () => {
    base.activatePopup('description-editor');
  }

  const handleNarrow = () => { org.narrowHeader(selectedHeaderId); }
  const handleEditClick = () => { org.toggleEdit(); }
  const handleWiden = () => { org.widenHeader(selectedHeaderId); }
  const handleAddNewHeader = () => { org.addHeaderAndEdit(selectedHeaderId)}
  const handleAddNestedHeader = () => { org.addNestedHeaderAndEdit(selectedHeaderId); }
  const handleMoveHeaderRight = () => { org.moveSubtreeRight(selectedHeaderId)}
  const handleMoveHeaderLeft = () => { org.moveSubtreeLeft(selectedHeaderId)}
  const handleMoveHeaderUp = () => { org.moveHeaderUp(selectedHeaderId)}
  const handleMoveHeaderDown = () => { org.moveHeaderDown(selectedHeaderId)}

  console.log(`selectedHeader: ${selectedHeaderId}, ${!!selectedHeaderId}`)

  return (
    <div className={`action-drawer-container nice-scroll ${isLoading ? "action-drawer-container-loading" : ""}`} >
      {
        <Fragment>
          {/*<ActionButton*/}
          {/*  iconName="cloud"*/}
          {/*  subIconName="sync-alt"*/}
          {/*  shouldSpinSubIcon={isLoading}*/}
          {/*  isDisabled={shouldDisableSyncButtons || !online}*/}
          {/*  onClick={handleSync}*/}
          {/*  style={{*/}
          {/*    opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,*/}
          {/*  }}*/}
          {/*  tooltip="Sync changes"*/}
          {/*/>*/}

          {/*<ActionButton*/}
          {/*  iconName="calendar-alt"*/}
          {/*  isDisabled={false}*/}
          {/*  onClick={handleAgendaClick}*/}
          {/*  style={{*/}
          {/*    opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,*/}
          {/*  }}*/}
          {/*  tooltip="Show agenda"*/}
          {/*/>*/}

          <ActionButton
            iconName="heading"
            isDisabled={!selectedHeaderId}
            onClick={handleShowTitleModal}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip="Edit header title"
          />

          <ActionButton
            iconName="pen-to-square"
            isDisabled={!selectedHeaderId}
            onClick={handleShowDescriptionModal}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip=""
          />


          <ActionButton
            iconName="arrow-right"
            isDisabled={!selectedHeaderId}
            onClick={handleMoveHeaderRight}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip=""
          />


          <ActionButton
            iconName="arrow-left"
            isDisabled={!selectedHeaderId}
            onClick={handleMoveHeaderLeft}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip=""
          />

          <ActionButton
            iconName="arrow-up"
            isDisabled={!selectedHeaderId}
            onClick={handleMoveHeaderUp}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip=""
          />

          <ActionButton
            iconName="arrow-down"
            isDisabled={!selectedHeaderId}
            onClick={handleMoveHeaderDown}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip=""
          />

          <ActionButton
            iconName="plus"
            isDisabled={!selectedHeaderId}
            onClick={handleAddNewHeader}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip="Create new header below"
          />

          <ActionButton
            iconName="arrow-circle-right"
            isDisabled={!selectedHeaderId}
            onClick={handleAddNestedHeader}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip="Create new nested header"
          />

          { isNarrowedHeaderActive ?
          <ActionButton
            iconName="expand"
            isDisabled={!selectedHeaderId}
            onClick={handleWiden}
            style={{
              opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
            }}
            tooltip="Widen"
          />
            :
            <ActionButton
              iconName="compress"
              isDisabled={!selectedHeaderId}
              onClick={handleNarrow}
              style={{
                opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,
              }}
              tooltip="Narrow"
            />

          }

          {/*{ editing ?*/}
          {/*<ActionButton*/}
          {/*  iconName="pencil"*/}
          {/*  isDisabled={false}*/}
          {/*  onClick={handleEditClick}*/}
          {/*  style={{*/}
          {/*    opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,*/}
          {/*  }}*/}
          {/*  tooltip="Edit"*/}
          {/*/> :*/}
          {/*  <ActionButton*/}
          {/*    iconName="eye"*/}
          {/*    isDisabled={false}*/}
          {/*    onClick={handleEditClick}*/}
          {/*    style={{*/}
          {/*      opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,*/}
          {/*    }}*/}
          {/*    tooltip="Edit"*/}
          {/*  />*/}
          {/*}*/}


          {/*<ActionButton*/}
          {/*  iconName="ellipsis-v"*/}
          {/*  isDisabled={false}*/}
          {/*  // onClick={handleAgendaClick}*/}
          {/*  style={{*/}
          {/*    opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,*/}
          {/*  }}*/}
          {/*  tooltip="More"*/}
          {/*/>*/}

          {/*{renderMovementButtons()}*/}

          {/*<ActionButton*/}
          {/*  iconName={'search'}*/}
          {/*  isDisabled={false}*/}
          {/*  onClick={handleSearchButtonClick}*/}
          {/*  additionalClassName={activeClocks !== 0 ? 'active-clock-indicator' : undefined}*/}
          {/*  style={{*/}
          {/*    opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1,*/}
          {/*    position: 'relative',*/}
          {/*    zIndex: 1,*/}
          {/*  }}*/}
          {/*  tooltip="Show Search / Task List"*/}
          {/*/>*/}

          {/*{renderCaptureButtons()}*/}
        </Fragment>
      }
    </div>
  );
};

const mapStateToProps = (state) => {
  const path = state.org.present.get('path');
  const files = state.org.present.get('files');
  const file = state.org.present.getIn(['files', path], Map());
  const editing = state.org.present.get('editing');
  const fileSettings = state.org.present.get('fileSettings');
  const searchFiles = determineIncludedFiles(files, fileSettings, path, 'includeInSearch', false);
  const activeClocks = Object.values(
    searchFiles.map((f) => (f.get('headers').size ? f.get('activeClocks') : 0)).toJS()
  ).reduce((acc, val) => (typeof val === 'number' ? acc + val : acc), 0);
  return {
    selectedHeaderId: file.get('selectedHeaderId'),
    isDirty: file.get('isDirty'),
    isNarrowedHeaderActive: !!file.get('narrowedHeaderId'),
    selectedTableCellId: file.get('selectedTableCellId'),
    captureTemplates: state.capture.get('captureTemplates', List()),
    path,
    isLoading: !state.base.get('isLoading').isEmpty(),
    online: state.base.get('online'),
    activeClocks,
    editing
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    org: bindActionCreators(orgActions, dispatch),
    capture: bindActionCreators(captureActions, dispatch),
    base: bindActionCreators(baseActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionDrawer);
